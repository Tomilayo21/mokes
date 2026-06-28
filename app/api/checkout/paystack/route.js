import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Clothing from "@/models/Clothing";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  try {
    console.log("========== PAYSTACK INIT START ==========");

    const session = await getServerSession(authOptions);
    console.log("SESSION USER:", session?.user);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id || session.user.email;

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

    console.log(
      "PAYSTACK KEY PREFIX:",
      PAYSTACK_SECRET_KEY?.slice(0, 10)
    );

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "Server misconfigured" },
        { status: 500 }
      );
    }

    await connectDB();
    console.log("MongoDB connected");

    const { items, address } = await req.json();

    console.log("RAW ITEMS:", items);
    console.log("RAW ADDRESS:", address);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    const itemsArray = items.map((item) => ({
      product: item._id || item.product,
      quantity: item.qty || item.quantity || 1,
      sizes: item.sizes || {},
    }));

    console.log("NORMALIZED ITEMS:", itemsArray);

    const validIds = itemsArray
      .map((item) => item.product)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    console.log("VALID IDS:", validIds);

    if (!validIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid product IDs found",
        },
        { status: 400 }
      );
    }

    const dbProducts = await Clothing.find({
      _id: { $in: validIds },
    });

    console.log(
      "DB PRODUCTS:",
      dbProducts.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.offerPrice ?? p.price,
      }))
    );

    if (!dbProducts.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Products not found in DB",
        },
        { status: 400 }
      );
    }

    const totalAmount = itemsArray.reduce((sum, item) => {
      const product = dbProducts.find(
        (p) => p._id.toString() === item.product
      );

      const price = product?.offerPrice ?? product?.price ?? 0;

      console.log("ITEM CALC:", {
        productId: item.product,
        quantity: item.quantity,
        found: !!product,
        price,
        subtotal: price * item.quantity,
      });

      return sum + price * item.quantity;
    }, 0);

    console.log("TOTAL AMOUNT:", totalAmount);

    const email =
      address?.email ||
      session.user.email ||
      "customer@fallback.com";

    console.log("FINAL EMAIL:", email);

    const domain =
      process.env.NEXTAUTH_URL || "http://localhost:3000";
      // process.env.NEXT_PUBLIC_LOCAL || "http://localhost:3000";

    const payload = {
      email,
      amount: Math.round(totalAmount * 100),
      currency: "NGN",
      callback_url: `${domain}/order-placed`,
      metadata: {
        userId: String(userId),
        addressId: String(address?._id),
        itemCount: itemsArray.length,
      },
    };

    console.log("PAYSTACK PAYLOAD:", payload);

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("PAYSTACK HTTP STATUS:", response.status);

    const paystackData = await response.json();

    console.log("PAYSTACK RESPONSE:", paystackData);

    if (!paystackData.status) {
      return NextResponse.json(
        {
          success: false,
          message: paystackData.message || "Paystack init failed",
        },
        { status: 400 }
      );
    }

    console.log("========== PAYSTACK INIT SUCCESS ==========");

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    });
  } catch (error) {
    console.error("[PAYSTACK_INIT_ERROR]", error);
    console.error(error.stack);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}