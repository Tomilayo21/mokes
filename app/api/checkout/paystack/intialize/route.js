import { NextResponse } from "next/server";
import axios from "axios";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    const { email, amount, items, address, userId } = await req.json();

    if (!email || !amount) {
      return NextResponse.json({ success: false, message: "Missing parameters" }, { status: 400 });
    }

    // ✅ Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // kobo (NGN) or cents if USD
        metadata: { items, address, userId },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-placed`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (err) {
    console.error("Paystack Init Error:", err.response?.data || err.message);
    return NextResponse.json(
      { success: false, message: "Paystack initialization failed" },
      { status: 500 }
    );
  }
}
