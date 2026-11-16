
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export async function POST(req) {
  try {
    const { email, message } = await req.json();

    if (
      typeof email !== "string" ||
      typeof message !== "string" ||
      !email.trim() ||
      !message.trim()
    ) {
      return NextResponse.json(
        { message: "Email and message are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (cleanEmail.length > 254 || cleanMessage.length > 5000) {
      return NextResponse.json(
        { message: "Email or message exceeds the allowed length." },
        { status: 400 }
      );
    }

    const safeEmail = escapeHtml(cleanEmail);
    const safeMessage = escapeHtml(cleanMessage);

    await transporter.sendMail({
      from: `"Code of War Contact" <${process.env.SMTP_USER}>`,
      to: [
        "tanpreetjhally300@gmail.com",
        "raghavbhargava3@gmail.com",
      ],
      replyTo: cleanEmail,
      subject: "New Contact Us Message - Code of War",
      text: `New contact message received.

From: ${cleanEmail}

Message:
${cleanMessage}`,
      html: `
        <div style="background:#000000;padding:32px 16px;font-family:Arial,sans-serif;color:#ffffff;">
          <div style="max-width:600px;margin:auto;background:#0a0a0a;border:1px solid #252525;border-radius:12px;padding:28px;">
            <h2 style="margin:0 0 8px;color:#60a5fa;">New Contact Message</h2>
            <p style="margin:0 0 24px;color:#9ca3af;">Someone has contacted Code of War.</p>

            <p style="color:#9ca3af;font-size:12px;text-transform:uppercase;">Sender Email</p>
            <p style="color:#ffffff;margin-top:6px;">${safeEmail}</p>

            <p style="color:#9ca3af;font-size:12px;text-transform:uppercase;margin-top:24px;">Message</p>
            <div style="background:#111111;border:1px solid #252525;border-radius:8px;padding:16px;color:#e5e7eb;line-height:1.7;white-space:pre-wrap;">${safeMessage}</div>

            <p style="margin-top:28px;color:#6b7280;font-size:12px;">Code of War · Contact Form</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { message: "Failed to send your message. Please try again later." },
      { status: 500 }
    );
  }
}
