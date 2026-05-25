// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Always return success to prevent email enumeration
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Generate token + expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token
    await PasswordReset.create({
      userId: user._id.toString(),
      token,
      expiresAt,
    });

    // Build reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Configure transporter (Yahoo/Gmail/SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Perfect Home Premium Real Estate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password. Click below to reset:</p>
        <a href="${resetUrl}" style="color: #FF6600; font-weight: bold;">Reset Password</a>
        <p>This link will expire in <b>1 hour</b>.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("🔥 [FORGOT_PASSWORD_ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
