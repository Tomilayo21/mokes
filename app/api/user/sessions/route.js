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

    const { os, browser, city, country, ip } = await req.json();

    const user = await User.findById(session.user.id);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - SESSION_TTL_DAYS);

    user.sessions = (user.sessions || []).filter(
      (s) => new Date(s.lastActive) > cutoffDate
    );

    let existingSession = user.sessions.find(
      (s) => s.os === os && s.browser === browser && s.ip === ip
    );

    if (existingSession) {
      existingSession.lastActive = new Date();
      existingSession.city = city;
      existingSession.country = country;
    } else {
      const token = crypto.randomUUID();

      existingSession = {
        token,
        os,
        browser,
        ip,
        city,
        country,
        lastActive: new Date(),
      };

      user.sessions.push(existingSession);
    }

    await user.save();

    return Response.json({
      success: true,
      token: existingSession.token,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}