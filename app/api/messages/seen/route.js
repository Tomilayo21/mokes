// app/api/messages/seen/route.js
import { NextResponse } from "next/server";
import Message from "@/models/Message";
import connectDB from "@/config/db";

export async function POST(req) {
  try {
    await connectDB();
    const { ids } = await req.json();

    await Message.updateMany({ _id: { $in: ids } }, { status: "seen" });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
