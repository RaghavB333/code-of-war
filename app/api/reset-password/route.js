
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongoose";
import User from "@/models/user.model";
import OtpChallenge from "@/models/otpChallenge";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await connectDB();

    const { resetToken, password } = await request.json();

    // 1. Validate request
    if (
      typeof resetToken !== "string" ||
      !resetToken ||
      typeof password !== "string" ||
      password.length < 6 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid reset token and password of 6-72 bytes are required.",
        },
        { status: 400 }
      );
    }

    const secret = process.env.RESET_TOKEN_SECRET;

    if (!secret) {
      throw new Error("RESET_TOKEN_SECRET is not configured");
    }

    // 2. Verify the dedicated password-reset token
    let payload;

    try {
      payload = jwt.verify(resetToken, secret, {
        algorithms: ["HS256"],
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Reset session expired or invalid. Please verify your OTP again.",
        },
        { status: 401 }
      );
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      payload.purpose !== "password_reset" ||
      typeof payload.email !== "string" ||
      typeof payload.challengeId !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password reset authorization.",
        },
        { status: 401 }
      );
    }

    const email = payload.email.trim().toLowerCase();

    // 3. Confirm the OTP was verified and the challenge is still valid
    const challenge = await OtpChallenge.findOne({
      _id: payload.challengeId,
      email,
      purpose: "reset_password",
      consumedAt: { $ne: null },
      expiresAt: { $gt: new Date() },
    });

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset session expired or already used. Please verify a new OTP.",
        },
        { status: 401 }
      );
    }

    // 4. Fetch the account and inspect its actual auth provider
    const user = await User.findOne({ email }).select(
      "+password"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to reset the password for this account.",
        },
        { status: 400 }
      );
    }

    // 5. Hash and update the new password
      const hashPassword = await User.hashPassword(password);

    user.password = hashPassword;
    user.passwordChangedAt = new Date();

    await user.save();

    // 6. Consume the reset challenge so this token cannot be reused
    await OtpChallenge.deleteOne({
      _id: challenge._id,
      consumedAt: { $ne: null },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully. Please log in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
