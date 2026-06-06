import connectDB from "@/config/db";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// -------------------------------------------------------------
// GET: Fetch all messages
// -------------------------------------------------------------
export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find().sort({ createdAt: 1 });

    return NextResponse.json(messages, { status: 200 });
  } catch (err) {
    console.error("GET /api/messages error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// -------------------------------------------------------------
// POST: Create a new message (requires login)
// -------------------------------------------------------------
export async function POST(req) {
  try {
    await connectDB();

    // 🔥 Get logged-in user from Next-Auth
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 🔥 Create message tied to logged-in user
    const message = await Message.create({
      ...body,
      senderId: session.user.id,  // <-- next-auth user ID
      read: false,
    });

    return NextResponse.json(message, { status: 201 });

  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
