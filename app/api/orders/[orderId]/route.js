// app/api/orders/[orderId]/route.js

import connectDB from "@/config/db";
import MokesOrder from "@/models/MokesOrder";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
  await connectDB();

  // ✅ FIX: unwrap params (IMPORTANT in Next.js 15+)
  const { orderId } = await params;

  const order = await MokesOrder.findById(orderId)
    .populate([
      { path: "address" },
      { path: "items.product" }
    ]);

  if (!order) {
    return NextResponse.json({
      success: false,
      message: "Order not found",
    });
  }

  return NextResponse.json({
    success: true,
    order,
  });
}