// lib/authAdmin.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { NextResponse } from "next/server";

/**
 * Use inside your route handlers to enforce admin access.
 * Returns the admin user object if authorized, otherwise returns a NextResponse you should return to client.
 */
export async function requireAdmin(request) {
  const session = await getServerSession({ req: request, ...authOptions });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
  }

  return session.user; // you can return the admin user object
}
