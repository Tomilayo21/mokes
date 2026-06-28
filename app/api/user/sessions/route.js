import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/config/db";
import User from "@/models/User";
import crypto from "crypto";

const SESSION_TTL_DAYS = 30;

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    return Response.json({
      sessions:
        user?.sessions?.sort(
          (a, b) => new Date(b.lastActive) - new Date(a.lastActive)
        ) || [],
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { os, browser, city, country, ip, token } = await req.json();

    const user = await User.findById(session.user.id);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // cleanup expired sessions
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    user.sessions = (user.sessions || []).filter(
      (s) => new Date(s.lastActive) > cutoffDate
    );

    let existingSession = null;

    // 🔥 PRIMARY MATCH: token
    if (token) {
      existingSession = user.sessions.find((s) => s.token === token);
    }

    // fallback (only if no token yet)
    if (!existingSession) {
      existingSession = user.sessions.find(
        (s) => s.os === os && s.browser === browser && s.ip === ip
      );
    }

    let sessionToken;

    if (existingSession) {
      existingSession.lastActive = new Date();
      existingSession.city = city;
      existingSession.country = country;
      sessionToken = existingSession.token;
    } else {
      sessionToken = crypto.randomUUID();

      user.sessions.push({
        token: sessionToken,
        os,
        browser,
        ip,
        city,
        country,
        lastActive: new Date(),
      });
    }

    await user.save();

    return Response.json({
      success: true,
      token: sessionToken,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}