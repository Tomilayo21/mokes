import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import SecuritySettings from "@/models/SecuritySettings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// ======================================================
// GET — Fetch user security settings
// ======================================================
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find security settings for this user
    let settings = await SecuritySettings.findOne({ userId });

    // Auto-create default settings if none exist
    if (!settings) {
      settings = await SecuritySettings.create({ userId });
    }

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error("Security GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ======================================================
// POST — Update user security settings
// ======================================================
export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const settings = await SecuritySettings.findOneAndUpdate(
      { userId },
      { ...body },
      { new: true, upsert: true }
    );

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error("Security POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
