import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/config/db";
import User from "@/models/User";
import { UAParser } from "ua-parser-js";

export async function POST(req) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ua = req.headers.get("user-agent") || "";
  const parser = new UAParser(ua);
  const device = parser.getResult();

  const os = device.os?.name || "Unknown OS";
  const browser = device.browser?.name || "Unknown Browser";

  const user = await User.findById(session.user.id);

  const existingIndex = user.sessions.findIndex(
    (s) => s.os === os && s.browser === browser
  );

  if (existingIndex > -1) {
    // 🔥 UPDATE ONLY lastActive
    user.sessions[existingIndex].lastActive = new Date();
  } else {
    // 🔥 NEW DEVICE
    user.sessions.push({
      token: crypto.randomUUID(),
      os,
      browser,
      ip: "unknown",
      city: "",
      country: "",
      lastActive: new Date(),
    });
  }

  await user.save();

  return Response.json({ success: true });
}

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ua = req.headers.get("user-agent") || "";

    const parser = new UAParser(ua);
    const device = parser.getResult();

    const os = device.os?.name || "Unknown OS";
    const browser = device.browser?.name || "Unknown Browser";

    const user = await User.findById(session.user.id);

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 🔥 Find existing device
    const existingIndex = user.sessions.findIndex(
      (s) => s.os === os && s.browser === browser
    );

    if (existingIndex > -1) {
      // UPDATE ONLY lastActive
      user.sessions[existingIndex].lastActive = new Date();
    } else {
      // CREATE NEW DEVICE
      user.sessions.push({
        token: crypto.randomUUID(),
        os,
        browser,
        ip: "unknown",
        city: "Lagos",
        country: "Nigeria",
        lastActive: new Date(),
      });
    }

    await user.save();

    return Response.json({
      sessions: user.sessions.sort(
        (a, b) =>
          new Date(b.lastActive) - new Date(a.lastActive)
      ),
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}