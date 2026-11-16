
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
          ? "Verify your Code of War account"
          : "Reset your Code of War password",

        text: `Your Code of War verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this code, please ignore this email.`,

        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>

            <body style="margin:0; padding:0; background-color:#000000; font-family:Arial,Helvetica,sans-serif;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#000000; padding:40px 15px;">

                <tr>
                  <td align="center">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="max-width:520px; background-color:#000000; border:1px solid #252525; border-radius:14px; overflow:hidden;">

                      <!-- Top Accent -->
                      <tr>
                        <td style="height:3px; background-color:#3b82f6;"></td>
                      </tr>

                      <!-- Header -->
                      <tr>
                        <td align="center" style="padding:38px 25px 20px;">

                          <p style="margin:0; color:#60a5fa; font-size:12px; font-weight:bold; letter-spacing:4px;">
                            CODE OF WAR
                          </p>

                          <h1 style="margin:28px 0 12px; color:#ffffff; font-size:25px; font-weight:700;">
                            ${isSignup ? "Verify Your Email" : "Reset Your Password"}
                          </h1>

                          <p style="margin:0; color:#9ca3af; font-size:14px; line-height:24px;">
                            ${
                              isSignup
                                ? "One last step to enter the arena. Verify your email address using the code below."
                                : "We received a request to reset your password. Use the verification code below to continue."
                            }
                          </p>

                        </td>
                      </tr>

                      <!-- OTP Section -->
                      <tr>
                        <td align="center" style="padding:25px 15px 30px;">

                          <p style="margin:0 0 20px; color:#cbd5e1; font-size:12px; letter-spacing:2px; text-transform:uppercase;">
                            Your Verification Code
                          </p>

                          <table cellpadding="0" cellspacing="7" border="0" align="center">
                            <tr>
                              ${String(otp)
                                .split("")
                                .map(
                                  (digit) => `
                                    <td align="center" valign="middle"
                                      style="
                                        width:42px;
                                        height:52px;
                                        background-color:#080808;
                                        border:1px solid #2563eb;
                                        border-radius:8px;
                                        color:#60a5fa;
                                        font-size:25px;
                                        font-weight:bold;
                                      ">
                                      ${digit}
                                    </td>
                                  `
                                )
                                .join("")}
                            </tr>
                          </table>

                          <p style="margin:22px 0 0; color:#9ca3af; font-size:13px;">
                            This code expires in
                            <strong style="color:#60a5fa;">
                              ${OTP_EXPIRY_MINUTES} minutes
                            </strong>.
                          </p>

                        </td>
                      </tr>

                      <!-- Security Notice -->
                      <tr>
                        <td style="padding:0 30px 30px;">

                          <table width="100%" cellpadding="0" cellspacing="0"
                            style="background-color:#080808; border:1px solid #252525; border-radius:8px;">

                            <tr>
                              <td style="padding:15px 16px;">

                                <p style="margin:0 0 6px; color:#60a5fa; font-size:12px; font-weight:bold; letter-spacing:1px;">
                                  SECURITY NOTICE
                                </p>

                                <p style="margin:0; color:#9ca3af; font-size:12px; line-height:20px;">
                                  Never share this code with anyone. Code of War will never ask you to disclose your OTP.
                                  If you didn't request this code, you can safely ignore this email.
                                </p>

                              </td>
                            </tr>

                          </table>

                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td align="center"
                          style="padding:22px 20px; border-top:1px solid #252525;">

                          <p style="margin:0; color:#64748b; font-size:11px; letter-spacing:2px;">
                            CODE OF WAR
                          </p>

                          <p style="margin:9px 0 0; color:#475569; font-size:11px;">
                            Sharpen Your Blades. Write Your Destiny.
                          </p>

                          <p style="margin:12px 0 0; color:#475569; font-size:10px;">
                            © ${new Date().getFullYear()} Code of War. All rights reserved.
                          </p>

                        </td>
                      </tr>

                    </table>

                  </td>
                </tr>

              </table>

            </body>
          </html>
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
