
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import nodemailer from "nodemailer";

import connectDB from "@/lib/mongoose";
import User from "@/models/user.model";
import OtpChallenge from "@/models/otpChallenge";

export const runtime = "nodejs";

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function hashOTP(otp) {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret) {
    throw new Error("OTP_HASH_SECRET is not configured");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(otp)
    .digest("hex");
}

export async function POST(request) {
    console.log("received request to send OTP");
  try {
    await connectDB();

    const body = await request.json();
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const { purpose } = body;

    // 1. Validate request
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email" },
        { status: 400 }
      );
    }

    if (!["verify_email", "reset_password"].includes(purpose)) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP purpose" },
        { status: 400 }
      );
    }

    // 2. Check whether a permanent user exists
    const existingUser = await User.findOne({ email }).select("_id authProvider");

    if (purpose === "verify_email" && existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    if (purpose === "reset_password" && !existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if(purpose === "reset_password" && existingUser.authProvider == 'google'){
      return NextResponse.json(
        { success: false, message: "This account uses Google sign-in. Please continue with Google."},
        { status: 400}
      )
    }

    // 3. Find the challenge for this email AND purpose
    const existingChallenge = await OtpChallenge.findOne({
      email,
      purpose,
    });

    // 4. Apply resend cooldown
    if (existingChallenge?.lastSentAt) {
      const secondsSinceLastSent =
        (Date.now() -
          new Date(existingChallenge.lastSentAt).getTime()) /
        1000;

      if (secondsSinceLastSent < RESEND_COOLDOWN_SECONDS) {
        const retryAfter = Math.ceil(
          RESEND_COOLDOWN_SECONDS - secondsSinceLastSent
        );

        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${retryAfter} seconds before requesting another OTP`,
            retryAfter,
          },
          {
            status: 429,
            headers: { "Retry-After": String(retryAfter) },
          }
        );
      }
    }

    // 5. Generate a cryptographically secure six-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOTP(otp);
    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    // 6. Create or update the existing challenge.
    // Resending replaces the previous hash, invalidating the old OTP.
    await OtpChallenge.findOneAndUpdate(
      { email, purpose },
      {
        $set: {
          user: existingUser?._id ?? null,
          otpHash,
          expiresAt,
          attempts: 0,
          consumedAt: null,
          lastSentAt: now,
        },
        $setOnInsert: {
          email,
          purpose,
        },
        $inc: {
          resendCount: 1,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // 7. Configure the email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const isSignup = purpose === "verify_email";

    // 8. Send OTP by email
    try {
      await transporter.sendMail({
        from: `"Code of War" <${process.env.SMTP_USER}>`,
        to: email,
        subject: isSignup
          ? "Verify your Code of War email"
          : "Reset your Code of War password",
        text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this code, you can ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2>${isSignup ? "Verify your email" : "Reset your password"}</h2>
            <p>Your Code of War verification code is:</p>
            <h1 style="letter-spacing: 8px;">${otp}</h1>
            <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p>If you did not request this code, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      // Do not leave an OTP usable when its email failed to send.
      await OtpChallenge.updateOne(
        { email, purpose, otpHash },
        { $set: { consumedAt: new Date() } }
      );

      console.error("OTP email delivery failed:", emailError);

      return NextResponse.json(
        { success: false, message: "Unable to send OTP email" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent to your email",
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP route error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
