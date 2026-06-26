import Stripe from "stripe";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import MokesOrder from "@/models/MokesOrder";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    return new NextResponse(
      `Webhook Error: ${err.message}`,
      { status: 400 }
    );
  }

  return NextResponse.json({ received: true });
}