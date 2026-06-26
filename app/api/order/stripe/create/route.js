// app/api/order/stripe/create/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Clothing from "@/models/Clothing";
import MokesOrder from "@/models/MokesOrder";
import User from "@/models/User";
import NotificationPreferences from "@/models/NotificationPreferences";
import { sendEmail } from "@/lib/email";
import Address from "@/models/Address";

export async function POST(req) {
  try {
    await connectDB();

    const { items, address, userId } = await req.json(); 
    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID missing" }, { status: 401 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid cart" }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItems = [];
    for (const { product, quantity } of items) {
      const p = await Clothing.findById(product);
      if (!p) throw new Error(`Product not found: ${product}`);
      if (p.stock < quantity) throw new Error(`Insufficient stock for ${p.name}`);

      const snapshotPrice = p.offerPrice || p.price;
      totalAmount += snapshotPrice * quantity;

      orderItems.push({ product, quantity, price: snapshotPrice });

      p.stock -= quantity;
      await p.save();
    }

    const order = await MokesOrder.create({
      userId,
      items: orderItems,
      address,
      amount: totalAmount,
      paymentMethod: "stripe",
      paymentStatus: "Successful",
      orderStatus: "Order Placed",
      date: Date.now(),
    });

    await User.findByIdAndUpdate(userId, { cartItems: {} });

    try {
      const buyer = await User.findById(userId);
      const buyerEmail = buyer?.email;
      const buyerName = buyer?.name || "Customer";

      const addressDoc = await Address.findById(order.address);
      const address = addressDoc
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


        const populatedOrder = await MokesOrder.findById(order._id)
          .populate("items.product", "name image price");

        const orderItemsHTML = populatedOrder.items
          .map(
            (item, i) => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">${i + 1}</td>
                <td style="padding:8px; display:flex; align-items:center; gap:10px;">
                  ${
                    item.product?.image?.length
                      ? `<img src="${item.product.image[0]}" alt="${item.product.name}" width="40" height="40" style="border-radius:6px; object-fit:cover;" />`
                      : ""
                  }
                  <span style="font-weight:500; color:#333;">${item.product?.name || "Unnamed Product"}</span>
                </td>
                <td style="padding:8px; text-align:center;">${item.quantity}</td>
                <td style="padding:8px;">₦${item.price.toLocaleString()}</td>
                <td style="padding:8px;">₦${(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            `
          )
          .join("");


      const emailHTML = `
        <div style="font-family:Arial, sans-serif; background:#f7f7f7; padding:30px;">
          <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 3px 10px rgba(0,0,0,0.08);">
            <div style="background:#ff6600; color:#fff; padding:16px 24px; text-align:center;">
              <h2 style="margin:0; font-weight:600; display:flex; align-items:center; gap:8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <path d="M3 6h18"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Order Confirmation
              </h2>

            </div>

            <div style="padding:24px;">
              <p style="font-size:16px; color:#333;">A new order has just been placed!</p>

              <h3 style="margin-top:20px; color:#444;">Order Details</h3>
              <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:10px;">
                <tbody>
                  <tr><td><b>Order ID:</b></td><td>${order.orderId}</td></tr>
                  <tr><td><b>Payment Method:</b></td><td>${order.paymentMethod}</td></tr>
                  <tr><td><b>Status:</b></td><td>${order.orderStatus}</td></tr>
                  <tr><td><b>Total Amount:</b></td><td><b>₦${order.amount.toLocaleString()}</b></td></tr>
                  <tr><td><b>Date:</b></td><td>${new Date(order.date).toLocaleString()}</td></tr>
                </tbody>
              </table>

              <h3 style="margin-top:20px; color:#444;">Shipping Address</h3>
              <div style="background:#fafafa; border:1px solid #eee; border-radius:8px; padding:12px;">
                ${address}
              </div>

              <h3 style="margin-top:20px; color:#444;">Items Ordered</h3>
              <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:10px;">
                <thead>
                  <tr style="background:#f5f5f5;">
                    <th style="text-align:left; padding:8px;">#</th>
                    <th style="text-align:left; padding:8px;">Product</th>
                    <th style="text-align:left; padding:8px;">Qty</th>
                    <th style="text-align:left; padding:8px;">Price</th>
                    <th style="text-align:left; padding:8px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHTML}
                </tbody>
              </table>

              <div style="text-align:right; margin-top:16px;">
                <h3 style="color:#333;">Total: ₦${order.amount.toLocaleString()}</h3>
              </div>

              <p style="font-size:13px; color:#777; margin-top:24px;">Thank you for shopping with us! You can view your order details anytime in your account dashboard.</p>
            </div>

            <div style="background:#ff6600; color:#fff; text-align:center; padding:12px; font-size:12px;">
              <p style="margin:0;">&copy; ${new Date().getFullYear()} CuscedaNG</p>
            </div>
          </div>
        </div>
      `;


      const buyerPrefs = await NotificationPreferences.findOne({ userId });
      const buyerWantsEmail = buyerPrefs?.orders?.newOrder ?? true;


      if (buyerEmail && buyerWantsEmail) {
        await sendEmail({
          to: buyerEmail,
          subject: `🧾 Your Order Confirmation — ${order.orderId}`,
          html: emailHTML,
        });
        console.log(`✅ Order confirmation sent to buyer: ${buyerEmail}`);
      } else {
        console.log("🚫 Skipped buyer email — preference disabled");
      }


      for (const email of adminEmails) {
        await sendEmail({
          to: email,
          subject: `🛒 New Order Placed — ${order.orderId}`,
          html: emailHTML.replace("🛍️ Order Confirmation", "📦 New Customer Order"),
        });
      }

      console.log(`✅ Sent order emails to ${adminEmails.length} admin(s) + buyer`);
    } catch (emailErr) {
      console.error("❌ Failed to send order notification:", emailErr);
    }
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("[STRIPE_ORDER_CREATE_ERROR]", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
