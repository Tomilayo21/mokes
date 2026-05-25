// lib/serverAuth.js
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies as nextCookies } from "next/headers";
import connectDB from "@/config/db";
import User from "@/models/User";

const COOKIE_NAME = process.env.COOKIE_NAME || "myapp_token";

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function getTokenFromRequest(req) {
  // 1) Try Authorization header (works for client-side fetch / axios requests)
  try {
    const authHeader =
      (typeof req?.headers?.get === "function" && req.headers.get("authorization")) ||
      req?.headers?.authorization ||
      "";
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.split(" ")[1];
    }
  } catch (e) {}

  // 2) Try next/headers cookie store (server)
  try {
    const cookieStore = nextCookies();
    const c = cookieStore.get(COOKIE_NAME)?.value;
    if (c) return c;
  } catch (e) {}

  // 3) Try req.cookies if present (some environments)
  try {
    const c = req?.cookies?.get?.(COOKIE_NAME)?.value;
    if (c) return c;
  } catch (e) {}

  return null;
}

export async function getUserFromRequest(req) {
  const token = await getTokenFromRequest(req);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded?.id) return null; // we standardize on `id`

  await connectDB();
  const user = await User.findById(decoded.id).lean();
  return user || null;
}

export async function requireAdmin(req) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin")
    return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
  return user;
}
