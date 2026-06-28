//app\api\order\paystack\create\route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Clothing from "@/models/Clothing";
import MokesOrder from "@/models/MokesOrder";
import User from "@/models/User";
import NotificationPreferences from "@/models/NotificationPreferences";
import { sendEmail } from "@/lib/email";
import Address from "@/models/Address";
import mongoose from "mongoose";

// ✅ NEXTAUTH FIX (IMPORTANT)
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

    const { items, address, reference } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID missing" },
        { status: 401 }
      );
    }

    // =========================
    // NORMALIZE ITEMS (FIXED)
    // =========================
    let normalizedItems = [];

    if (Array.isArray(items)) {
      normalizedItems = items
        .map((item) => ({
          product: String(item._id || item.product || item.productId),
          quantity: Number(item.qty || item.quantity || 1),
          sizes: item.sizes || {},
          name: item.name,
          image: item.image,
        }))
        .filter((item) => mongoose.Types.ObjectId.isValid(item.product));
    } else if (items && typeof items === "object") {
      normalizedItems = Object.entries(items).map(([product, qty]) => ({
        product,
        quantity: Number(qty),
      }));
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid items format",
        },
        { status: 400 }
      );
    }

    // =========================
    // STRONG VALIDATION (NEW)
    // =========================
    normalizedItems = normalizedItems.filter(
      (item) => item.product && item.quantity > 0
    );

    if (!normalizedItems.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid items found in cart",
        },
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
    // CALCULATE ORDER
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

      if (item.sizes) {
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

      const snapshotPrice = p.offerPrice || p.price;
      totalAmount += snapshotPrice * quantity;

      orderItems.push({
        product: productId,
        quantity,
        price: snapshotPrice,
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
    // EMAIL SYSTEM (UNCHANGED LOGIC)
    // =========================
    try {
      const buyer = await User.findById(userId);
      const buyerEmail = buyer?.email;
      const buyerName = buyer?.name || "Customer";

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
                      ? `<img src="${item.product.image[0]}" width="40" height="40" style="border-radius:6px; object-fit:cover;" />`
                      : ""
                  }
                  <span style="font-weight:500; color:#333;">
                    ${item.product?.name || "Unnamed Product"}
                  </span>
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
        <div style="font-family:Arial, sans-serif; background:#f7f7f7; padding:30px;">
          <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(0,0,0,0.08);">
            <div style="background:#ff6600; color:#fff; padding:16px 24px; text-align:center;">
              <h2 style="margin:0;">Order Confirmation</h2>
            </div>

            <div style="padding:24px;">
              <p>A new order has just been placed!</p>

              <h3>Order Details</h3>
              <p><b>Order ID:</b> ${order._id}</p>
              <p><b>Total:</b> ₦${order.amount.toLocaleString()}</p>

              <h3>Shipping Address</h3>
              ${formattedAddress}

              <h3>Items</h3>
              <table>
                <tbody>${orderItemsHTML}</tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      const buyerPrefs = await NotificationPreferences.findOne({ userId });
      const buyerWantsEmail = buyerPrefs?.orders?.newOrder ?? true;

      if (buyerEmail && buyerWantsEmail) {
        await sendEmail({
          to: buyerEmail,
          subject: `🧾 Your Order Confirmation — ${order._id}`,
          html: emailHTML,
        });
      }

      for (const email of adminEmails) {
        await sendEmail({
          to: email,
          subject: `🛒 New Order Placed — ${order._id}`,
          html: emailHTML,
        });
      }
    } catch (emailErr) {
      console.error("❌ Failed to send order notification:", emailErr);
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("[PAYSTACK_ORDER_CREATE_ERROR]", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}