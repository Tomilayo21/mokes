import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectDB from "@/config/db";
import { cookies } from "next/headers";

export async function verifyAuth() {
  try {
    await connectDB();

    // 👇 must be awaited here
    const cookieStore = await cookies();
    const token = cookieStore.get("myapp_token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "-passwordHash -resetToken -resetTokenExpiry"
    );

    return user;
  } catch (err) {
    console.error("❌ Auth error:", err);
    return null;
  }
}
