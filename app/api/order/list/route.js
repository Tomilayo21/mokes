import connectDB from "@/config/db";
import Address from "@/models/Address";
import MokesOrder from "@/models/MokesOrder";
import Clothing from "@/models/Clothing";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    // Extract userId from Authorization header
    const authHeader = request.headers.get("Authorization") || "";
    const userId = authHeader.replace("Bearer ", "");

    if (!userId) {
      return NextResponse.json({ success: false, message: "No user ID provided" });
    }

    const orders = await MokesOrder.find({ userId }).populate("address items.product");

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}