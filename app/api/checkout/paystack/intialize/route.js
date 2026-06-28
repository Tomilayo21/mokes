//app\api\checkout\paystack\intialize\route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Clothing from "@/models/Clothing";
import MokesOrder from "@/models/MokesOrder";
import User from "@/models/User";
import NotificationPreferences from "@/models/NotificationPreferences";
import { sendEmail } from "@/lib/email";
import Address from "@/models/Address";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id || session.user.email;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID missing" },
        { status: 401 }
      );
    }

    const { items, address, reference } = await req.json();

    // =========================
    // SAFE NORMALIZATION
    // =========================

    let normalizedItems = [];

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, message: "Invalid items format" },
        { status: 400 }
      );
    }

    normalizedItems = items
      .map(item => ({
        product: String(item.product || item._id || item.productId),
        quantity: Number(item.quantity || item.qty || 1),
        sizes: item.sizes || {},
      }))
      .filter(item => mongoose.Types.ObjectId.isValid(item.product));

      if (normalizedItems.length === 0) {
        return NextResponse.json(
          { success: false, message: "No valid cart items after validation" },
          { status: 400 }
        );
      }      
    // =========================
    // VALIDATION
    // =========================
    normalizedItems = normalizedItems.filter(
      (item) =>
        item.product &&
        mongoose.Types.ObjectId.isValid(item.product) &&
        item.quantity > 0
    );

    if (!address || normalizedItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order data" },
        { status: 400 }
      );
    }

    // =========================
    // DUPLICATE ORDER CHECK
    // =========================
    if (reference) {
      const existingOrder = await MokesOrder.findOne({
        referenceId: reference,
      });

      if (existingOrder) {
        return NextResponse.json({
          success: true,
          order: existingOrder,
          message: "Order already exists",
        });
      }
    }

    // =========================
    // ORDER CALCULATION
    // =========================
    let totalAmount = 0;
    const orderItems = [];

    for (const item of normalizedItems) {
      const productId = item.product;
      const quantity = item.quantity;

      const p = await Clothing.findById(productId);

      if (!p) {
        return NextResponse.json(
          { success: false, message: `Product not found: ${productId}` },
          { status: 404 }
        );
      }

      // Handle size-based stock
      if (item.sizes && Object.keys(item.sizes).length > 0) {
        for (const [sizeName, qty] of Object.entries(item.sizes)) {
          const sizeObj = p.sizes.find((s) => s.size === sizeName);

          if (!sizeObj) {
            return NextResponse.json(
              {
                success: false,
                message: `Size ${sizeName} not found for ${p.name}`,
              },
              { status: 400 }
            );
          }

          if (sizeObj.stock < qty) {
            return NextResponse.json(
              {
                success: false,
                message: `Insufficient stock for ${p.name} (${sizeName})`,
              },
              { status: 400 }
            );
          }

          sizeObj.stock -= qty;
        }
      }

      const price = p.offerPrice || p.price;
      totalAmount += price * quantity;

      orderItems.push({
        product: productId,
        quantity,
        price,
        sizes: item.sizes || {},
      });

      await p.save();
    }

    // =========================
    // CREATE ORDER
    // =========================
    const order = await MokesOrder.create({
      userId,
      items: orderItems,
      address: address._id || address,
      amount: totalAmount,
      paymentMethod: "paystack",
      paymentStatus: "Successful",
      orderStatus: "Order Placed",
      referenceId: reference || null,
      date: Date.now(),
    });

    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // =========================
    // EMAIL SECTION (UNCHANGED LOGIC)
    // =========================
    try {
      const buyer = await User.findById(userId);
      const buyerEmail = buyer?.email;

      const addressDoc = await Address.findById(order.address);

      const formattedAddress = addressDoc
        ? `
          <p style="margin: 0; color: #444;">
            <b>${addressDoc.fullName}</b><br />
            ${addressDoc.area},<br />
            ${addressDoc.city}, ${addressDoc.state}<br />
            ${addressDoc.country}<br />
            <small>Phone: ${addressDoc.phoneNumber}</small>
          </p>
        `
        : "<p>No address provided</p>";

      const subscribedUsers = await NotificationPreferences.find({
        "orders.newOrder": true,
      }).populate("userId", "email name");

      const adminEmails = subscribedUsers
        .map((pref) => pref.userId?.email)
        .filter(Boolean);

      const populatedOrder = await MokesOrder.findById(order._id).populate(
        "items.product",
        "name image price"
      );

      const orderItemsHTML = populatedOrder.items
        .map(
          (item, i) => `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:8px;">${i + 1}</td>
              <td style="padding:8px; display:flex; align-items:center; gap:10px;">
                ${
                  item.product?.image?.length
                    ? `<img src="${item.product.image[0]}" width="40" height="40" style="border-radius:6px;" />`
                    : ""
                }
                <span>${item.product?.name || "Unnamed Product"}</span>
              </td>
              <td style="padding:8px;">${item.quantity}</td>
              <td style="padding:8px;">₦${item.price.toLocaleString()}</td>
              <td style="padding:8px;">₦${(
                item.quantity * item.price
              ).toLocaleString()}</td>
            </tr>
          `
        )
        .join("");

      const emailHTML = `
        <div style="font-family:Arial; padding:20px;">
          <h2>Order Confirmation</h2>
          <p>New order placed!</p>
          <p><b>Order ID:</b> ${order._id}</p>
          <p><b>Total:</b> ₦${order.amount.toLocaleString()}</p>
        </div>
      `;

      const buyerPrefs = await NotificationPreferences.findOne({ userId });
      const buyerWantsEmail = buyerPrefs?.orders?.newOrder ?? true;

      if (buyerEmail && buyerWantsEmail) {
        await sendEmail({
          to: buyerEmail,
          subject: `🧾 Order Confirmation — ${order._id}`,
          html: emailHTML,
        });
      }

      for (const email of adminEmails) {
        await sendEmail({
          to: email,
          subject: `🛒 New Order — ${order._id}`,
          html: emailHTML,
        });
      }
    } catch (emailErr) {
      console.error("Email error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("[PAYSTACK_ORDER_CREATE_ERROR]", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}