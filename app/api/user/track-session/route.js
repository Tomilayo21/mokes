import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/config/db";
import User from "@/models/User";
import crypto from "crypto";

const SESSION_TTL_DAYS = 30; // Sessions older than 30 days are removed

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { os, browser, city, country, ip } = await req.json();

    if (!os || !browser) {
      return new Response(JSON.stringify({ error: "OS and browser are required" }), { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) return new Response("User not found", { status: 404 });

    // Remove old sessions
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - SESSION_TTL_DAYS);
    user.sessions = user.sessions.filter(s => new Date(s.lastActive) > cutoffDate);

    // Check for existing session with same OS/browser/IP
    let existingSession = user.sessions.find(
      s => s.os === os && s.browser === browser && s.ip === ip
    );

    if (existingSession) {
      // Update lastActive and location info
      existingSession.lastActive = new Date();
      existingSession.city = city;
      existingSession.country = country;
    } else {
      // Create new session
      const token = crypto.randomUUID();
      existingSession = { token, os, browser, ip, city, country, lastActive: new Date() };
      user.sessions.push(existingSession);
    }

    await user.save();

    return new Response(JSON.stringify({ ok: true, token: existingSession.token }), { status: 200 });
  } catch (err) {
    console.error("Track session error:", err);
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 });
  }
}
