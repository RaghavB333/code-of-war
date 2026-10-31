
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import connectDB from "@/lib/mongoose";
import OtpChallenge from "@/models/otpChallenge";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const otp = body.otp;

    const purpose = body.purpose;

    // 1. Validate request
    if (!email || !otp || !purpose) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, OTP and purpose are required.",
        },
        { status: 400 }
      );
    }

    if (!["verify_email", "reset_password"].includes(purpose)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP verification purpose.",
        },
        { status: 400 }
      );
    }

    // 2. Find OTP challenge and explicitly select otpHash
    const challenge = await OtpChallenge.findOne({
      email,
      purpose,
    }).select("+otpHash");

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found. Please request a new OTP.",
        },
        { status: 404 }
      );
    }

    // 3. Prevent OTP reuse
    if (challenge.consumedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "This OTP has already been used.",
        },
        { status: 400 }
      );
    }

    // 4. Check expiry
    if (challenge.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        },
        { status: 410 }
      );
    }

    // 5. Check maximum attempts
    if (challenge.attempts >= challenge.maxAttempts) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Maximum attempts exceeded. Please request a new OTP.",
        },
        { status: 429 }
      );
    }

    function hashOtp(otp) {
        const secret = process.env.OTP_HASH_SECRET;

        if (!secret) {
            throw new Error("OTP_SECRET is not configured");
        }

        return crypto
            .createHmac("sha256", secret)
            .update(otp)
            .digest("hex");
    }

    const submittedHash = hashOtp(otp);

    const storedHash = challenge.otpHash;

    const isOtpValid =
    Buffer.from(submittedHash, "hex").length ===
        Buffer.from(storedHash, "hex").length &&
    crypto.timingSafeEqual(
        Buffer.from(submittedHash, "hex"),
        Buffer.from(storedHash, "hex")
    );

    if (!isOtpValid) {
      // Increment attempts only if the challenge is still active
      const updatedChallenge =
        await OtpChallenge.findOneAndUpdate(
          {
            _id: challenge._id,
            consumedAt: null,
            expiresAt: { $gt: new Date() },
            $expr: {
              $lt: ["$attempts", "$maxAttempts"],
            },
          },
          {
            $inc: { attempts: 1 },
          },
          {
            new: true,
          }
        );

      if (!updatedChallenge) {
        return NextResponse.json(
          {
            success: false,
            message:
              "OTP expired or maximum attempts exceeded. Please request a new OTP.",
          },
          { status: 429 }
        );
      }

      const remainingAttempts = Math.max(
        0,
        updatedChallenge.maxAttempts -
          updatedChallenge.attempts
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP. Please try again.",
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // 7. Atomically consume the OTP.
    // This helps prevent concurrent requests from reusing it.
    const consumedChallenge =
      await OtpChallenge.findOneAndUpdate(
        {
          _id: challenge._id,
          consumedAt: null,
          expiresAt: { $gt: new Date() },
          $expr: {
            $lt: ["$attempts", "$maxAttempts"],
          },
        },
        {
          $set: {
            consumedAt: new Date(),
          },
        },
        {
          new: true,
        }
      );

    if (!consumedChallenge) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP is expired or has already been used. Please request a new OTP.",
        },
        { status: 409 }
      );
    }

    if (purpose === "reset_password") {
      const secret = process.env.RESET_TOKEN_SECRET;

      if (!secret) {
        throw new Error("RESET_TOKEN_SECRET is not configured");
      }

      // Mark the OTP as consumed and preserve the challenge
      // long enough to complete the password reset.
      challenge.consumedAt = new Date();
      challenge.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await challenge.save();

      const resetToken = jwt.sign(
        {
          email: challenge.email,
          purpose: "password_reset",
          challengeId: challenge._id.toString(),
        },
        secret,
        {
          algorithm: "HS256",
          expiresIn: "10m",
        }
      );

      return Response.json({
        success: true,
        message: "OTP verified. You can now reset your password.",
        resetToken,
      });
    }

    // 8. Return success
    return NextResponse.json(
      {
        success: true,
        message:
          purpose === "verify_email"
            ? "Email verified successfully."
            : "OTP verified successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while verifying OTP.",
      },
      { status: 500 }
    );
  }
}
