
// app/api/users/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // Fetch all users (excluding sensitive fields)
    const users = await User.find().select(
      "-passwordHash -resetToken -resetTokenExpiry"
    );

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error("🔥 [GET_USERS_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
