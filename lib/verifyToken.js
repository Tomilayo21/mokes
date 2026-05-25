// lib/verifyToken.js
import jwt from "jsonwebtoken";
import connectDB from "@/config/db";
import User from "@/models/User";

/**
 * Returns user document if token is valid, otherwise null.
 * Expects `Authorization: Bearer <token>` in request headers.
 */
export async function getUserFromRequest(req) {
  try {
    const authHeader = (req.headers.get?.("authorization") ?? req.headers.get?.("Authorization")) || "";
    const token = authHeader.split?.(" ")[1] ?? null;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return null;

    await connectDB();
    const user = await User.findById(decoded.id).lean();
    return user || null;
  } catch (err) {
    console.error("getUserFromRequest error:", err.message || err);
    return null;
  }
}
