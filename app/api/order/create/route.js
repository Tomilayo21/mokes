//Both Paystack and Stripe
import Clothing from "@/models/Clothing";
import User from "@/models/User";
import MokesOrder from "@/models/MokesOrder";
import connectDB from "@/config/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const source = url.searchParams.get("source") || "client";
    console.log("[ORDER_CREATE] Source:", source);

    let userId, address, items, paymentMethod;

    // 🔹 Stripe webhook flow
    if (source === "stripe-webhook") {
      const body = await request.json();
      console.log("[STRIPE_WEBHOOK_ORDER_BODY]", JSON.stringify(body, null, 2));

      const session = body.data?.object;
      if (!session?.metadata) {
        throw new Error("Stripe metadata missing");
      }

      userId = session.metadata.userId;
      address = JSON.parse(session.metadata.address || "{}");
      items = JSON.parse(session.metadata.items || "{}");
      paymentMethod = "Stripe";
    } 
    // 🔹 Paystack + client flow
    else {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const body = await request.json();
      console.log("[CLIENT_ORDER_BODY]", body);

      userId = session.user.id;
      address = body.address;
      items = body.items;
      paymentMethod =
        body.paymentMethod || (source === "paystack" ? "Paystack" : "Manual");
    }

    // 🔹 Normalize items: convert { productId: qty } → array
    let itemsArray = [];
    if (Array.isArray(items)) {
      itemsArray = items;
    } else if (items && typeof items === "object") {
      itemsArray = Object.entries(items).map(([product, quantity]) => ({
        product,
        quantity,
      }));
    }

    if (!address || itemsArray.length === 0) {
      console.error("[ORDER_CREATE_ERROR] Invalid data", { address, items, paymentMethod });
      return NextResponse.json(
        { success: false, message: "Invalid order data" },
        { status: 400 }
      );
    }

    // 🔹 Validate stock + calculate total
    let totalAmount = 0;
    for (const item of itemsArray) {
      const product = await Clothing.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      totalAmount += (product.offerPrice || product.price) * item.quantity;
    }

    // 🔹 Deduct stock
    for (const item of itemsArray) {
      const product = await Clothing.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    // 🔹 Save order in DB (Stripe + Paystack both persist)
    const order = await MokesOrder.create({
      userId,
      address,
      items: itemsArray,
      amount: totalAmount,
      date: Date.now(),
      paymentMethod,
      status: "Order Placed",
    });

    console.log("[ORDER_CREATE_SUCCESS] Order ID:", order._id);

    // 🔹 Clear cart
    const user = await User.findById(userId);
    if (user) {
      user.cartItems = {};
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("[ORDER_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
