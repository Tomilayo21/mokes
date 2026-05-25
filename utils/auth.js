
// utils/auth.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"; // default 7 days
const COOKIE_NAME = process.env.COOKIE_NAME || "myapp_token";

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Extracts and verifies the JWT from the request.
 * Works with either:
 *  - Authorization header (Bearer token)
 *  - Cookie (myapp_token)
 */
export async function getUserFromRequest(req) {
  try {
    // ✅ Try Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      return verifyToken(token);
    }

    // ✅ Try Cookie
    const cookie = req.cookies?.get(COOKIE_NAME)?.value;
    if (cookie) {
      return verifyToken(cookie);
    }

    return null;
  } catch (err) {
    console.error("getUserFromRequest error:", err);
    return null;
  }
}

export { COOKIE_NAME };
