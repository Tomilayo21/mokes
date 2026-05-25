import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email } = await req.json();

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });

  return NextResponse.json({
    exists: !!user,
  });
}