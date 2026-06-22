import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectDB();

    // Get raw body and headers
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Only process successful charges
    if (event.event === "charge.success") {
      const data = event.data;

      // Find order by referenceId (schema field)
      const order = await Order.findOne({ referenceId: data.reference });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Update payment status
      order.paymentStatus = "Successful";
      order.orderStatus = "Order Placed";
      await order.save();

      return NextResponse.json({ received: true }, { status: 200 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Paystack Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
