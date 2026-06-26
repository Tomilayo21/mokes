import connectDB from "@/config/db";
import MokesOrder from "@/models/MokesOrder";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();

  const order = await MokesOrder.findById(params.orderId)
    .populate("items.product");

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