import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Session token required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const sessionExists = user.sessions.find((s) => s.token === token);
    if (!sessionExists) {
      return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
    }

    // Remove the session (this will invalidate JWT for this device)
    user.sessions = user.sessions.filter((s) => s.token !== token);
    await user.save();

    return NextResponse.json({ success: true, message: "Session logged out successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
