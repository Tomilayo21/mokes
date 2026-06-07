// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import { comparePassword } from "@/utils/auth";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ❌ Block login if not verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Email not verified. Please check your inbox." },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const expiresIn = rememberMe ? "30d" : "1d";

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

 const response = NextResponse.json({
  success: true,
  user: {
    _id: user._id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    cartItems: user.cartItems || {}
  }
});

response.cookies.set("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days or 1 day
});



return response;

  } catch (err) {
    console.error("🔥 [LOGIN_ERROR]", err);
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
