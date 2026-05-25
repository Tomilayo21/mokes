// app/api/user/change-password/route.js 
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/authOptions";

function validatePasswordRules(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must include an uppercase letter");
  if (!/[!@#$%^&*(),.?\":{}|<>[\]\\\/~`+=;:_-]/.test(password)) errors.push("Password must include a special character");
  return errors;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const passErrors = validatePasswordRules(newPassword);
    if (passErrors.length) return NextResponse.json({ error: "Weak password", fieldErrors: { newPassword: passErrors.join(". ") } }, { status: 400 });

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return NextResponse.json({ error: "Current password incorrect" }, { status: 403 });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
