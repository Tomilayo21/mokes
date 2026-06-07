import connectDB from "@/config/db";
import User from "@/models/User";
import { UAParser } from "ua-parser-js";

export async function POST(req) {
  await connectDB();

  const ua = req.headers.get("user-agent") || "";
  const parser = new UAParser(ua);
  const device = parser.getResult();

  const rawIp =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "";

  const ip = rawIp.split(",")[0].trim();

  let city = "Unknown";
  let country = "Unknown";

  // safer IP check
  if (ip && ip !== "unknown") {
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await res.json();

      city = data?.city || "Unknown";
      country = data?.country_name || "Unknown";
    } catch {}
  }

  const { userId } = await req.json();

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  const sessionData = {
    token: crypto.randomUUID(),
    os: device.os?.name || "Unknown OS",
    browser: device.browser?.name || "Unknown Browser",
    ip: ip || "Unknown",
    city,
    country,
    lastActive: new Date(),
  };

  await User.findByIdAndUpdate(userId, {
    $push: { sessions: sessionData },
  });

  return Response.json({ success: true });
}