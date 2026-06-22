import Stripe from "stripe";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: false },
};

export async function POST(req) {
  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await connectDB();

    // ✅ Find existing order instead of creating new
    const order = await Order.findOne({ sessionId: session.id });
    if (order) {
      order.paymentStatus = "Successful";
      order.orderStatus = "Order Placed";
      await order.save();
      console.log("✅ Stripe order updated:", order._id);
    } else {
      console.warn("⚠️ Stripe session completed but no matching order found:", session.id);
    }
  }

  return NextResponse.json({ received: true });
}
