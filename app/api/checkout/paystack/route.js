import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Clothing from "@/models/Clothing";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ success: false, message: "Server misconfigured" }, { status: 500 });
    }

    await connectDB();

    const body = await req.json();
    const { items, address, userId } = body;

    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    if (!items || Object.keys(items).length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    const itemsArray = Object.entries(items).map(([id, qty]) => ({ product: id, quantity: qty }));

    const validIds = itemsArray
      .map(item => item.product)
      .filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) return NextResponse.json({ success: false, message: "No valid products" }, { status: 400 });

    const dbProducts = await Clothing.find({ _id: { $in: validIds } });
    if (!dbProducts.length) return NextResponse.json({ success: false, message: "Products not found" }, { status: 404 });

    const totalAmount = itemsArray.reduce((sum, item) => {
      const product = dbProducts.find(p => p._id.toString() === item.product);
      return sum + (product?.offerPrice || 0) * item.quantity;
    }, 0);

    if (totalAmount <= 0) return NextResponse.json({ success: false, message: "Invalid total" }, { status: 400 });

    const domain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

    const payload = {
      email: address?.email || `customer_${userId}@paystacktest.org`,
      amount: Math.round(totalAmount * 100),
      currency: "NGN",
      callback_url: `${domain}/order-placed`,
      metadata: { userId, address, items: itemsArray },
    };

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const paystackData = await response.json();

    if (!paystackData.status) return NextResponse.json({ success: false, message: paystackData.message || "Paystack init failed" }, { status: 400 });

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    });
  } catch (error) {
    console.error("[PAYSTACK_INIT_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
