import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import MokesOrder from "@/models/MokesOrder";

export async function GET(req, { params }) {
  await connectDB();
  const order = await MokesOrder.findOne({ sessionId: params.sessionId });

  if (!order) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: true, order });
}
