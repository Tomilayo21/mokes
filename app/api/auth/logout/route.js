// app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/utils/auth";
import { logActivity } from "@/utils/logActivity";
import connectDB from "@/config/db";

export async function POST(req) {
  try {
    // optional: log who logged out (read cookie)
    const token = req.cookies?.get?.(COOKIE_NAME)?.value;
    // decode token minimally to get sub, or leave anonymous
    await connectDB();

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });

    await logActivity({ type: "user", action: "Logged Out", entityId: null, userId: null });

    return res;
  } catch (err) {
    console.error("[LOGOUT_ERROR]", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
