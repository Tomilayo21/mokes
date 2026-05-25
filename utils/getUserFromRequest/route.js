// utils/getUserFromRequest.js
import { verifyToken } from "@/utils/auth";
import connectDB from "@/config/db";
import User from "@/models/User";
import { COOKIE_NAME } from "@/utils/auth";

export async function getUserFromRequest(req) {
  try {
    // in Next.js route handlers: req.cookies?.get ?
    const token = req.cookies?.get?.(COOKIE_NAME)?.value || (req.headers?.get && req.headers.get("authorization")?.split(" ")[1]);
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload?.sub) return null;
    await connectDB();
    const user = await User.findById(payload.sub).lean();
    return user || null;
  } catch (err) {
    console.error("[getUserFromRequest]", err);
    return null;
  }
}
