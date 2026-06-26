// app/api/order/update-status/route.js
import connectDB from "@/config/db";
import MokesOrder from "@/models/MokesOrder";
import NotificationPreferences from "@/models/NotificationPreferences";
import { sendEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/authAdmin";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Address from "@/models/Address"; // 👈 Make sure you have this model

export async function POST(request) {
  try {
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser;

    await connectDB();

    const { orderId, status } = await request.json();
    if (!orderId || !status)
      return NextResponse.json({ success: false, message: "Order ID or status missing" });

    // ✅ Fetch order, user, and address
    const order = await MokesOrder.findOne({ orderId })
      .populate("items.product", "name") // populate product names
      .populate("address"); // populate shipping address

    if (!order) return NextResponse.json({ success: false, message: "Order not found" });

    const user = await User.findById(order.userId).select("email name");
    const buyerEmail = user?.email;
    const buyerName = user?.name || "Customer";
    const userId = user?._id;

    if (!buyerEmail || !userId)
      return NextResponse.json({ success: true, message: "Order updated, but user data missing." });

    // ✅ Update order status
    order.orderStatus = status;
    await order.save();

    // ✅ Load notification prefs
    const prefs = await NotificationPreferences.findOne({ userId });
    const wantsShipped = prefs?.orders?.shipped ?? true;
    const wantsDelivered = prefs?.orders?.delivered ?? true;

    // ✅ Prepare email content
    let subject = "";
    let html = "";

    if (status === "Shipped" && wantsShipped) {
      subject = `Your Order Has Been Shipped — ${order.orderId}`;
      html = generateEmailTemplate({
        title: "Order Shipped",
        message: `Your order <b>${order.orderId}</b> has been shipped!`,
        order,
        buyerName,
      });
    }

    if (status === "Delivered" && wantsDelivered) {
      subject = `Your Order Has Been Delivered — ${order.orderId}`;
      html = generateEmailTemplate({
        title: "Order Delivered",
        message: `Your order <b>${order.orderId}</b> has been delivered. Thank you for shopping with us!`,
        order,
        buyerName,
      });
    }

    if (subject) {
      console.log("📧 Sending email to:", buyerEmail);
      await sendEmail({ to: buyerEmail, subject, html });
      console.log(`✅ ${status} email sent to ${buyerEmail}`);
    } else {
      console.log(`ℹ️ Email skipped — no preference or irrelevant status (${status})`);
    }

    return NextResponse.json({
      success: true,
      message: `Order updated to ${status} successfully.`,
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

// ✅ Email Template — full order summary
function generateEmailTemplate({ title, message, order, buyerName }) {
  const address = order.address;
  const items = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.product?.name || "Unknown Product"}</td>
          <td>x${item.quantity}</td>
          <td>₦${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f7;padding:30px;">
    <div style="max-width:650px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.08);">
      <div style="background:#ff6600;color:#fff;padding:16px 24px;text-align:center;">
        <h2 style="margin:0;font-weight:600;">${title}</h2>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;color:#333;">Hi ${buyerName},</p>
        <p style="font-size:15px;color:#555;">${message}</p>

        <h3 style="margin-top:25px;color:#444;">Order Summary</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th align="left" style="padding:8px;">Product</th>
              <th align="left" style="padding:8px;">Qty</th>
              <th align="left" style="padding:8px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
        </table>

        <h3 style="margin-top:25px;color:#444;">Shipping Address</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px;">
          <tbody>
            <tr><td><b>Name:</b></td><td>${address?.name || buyerName}</td></tr>
            <tr><td><b>Country:</b></td><td>${address?.country || "—"}</td></tr>
            <tr><td><b>State, City:</b></td><td>${address?.state || "—"}, ${address?.city || "—"}</td></tr>
            <tr><td><b>Phone:</b></td><td>${address?.phoneNumber || "—"}</td></tr>
          </tbody>
        </table>

        <h3 style="margin-top:25px;color:#444;">Order Info</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px;">
          <tbody>
            <tr><td><b>Payment:</b></td><td>${order.paymentMethod}</td></tr>
            <tr><td><b>Order ID:</b></td><td>${order.orderId}</td></tr>
            <tr><td><b>Date:</b></td><td>${new Date(order.date).toLocaleString()}</td></tr>
            <tr><td><b>Payment Status:</b></td><td>${order.paymentStatus}</td></tr>
            <tr><td><b>Order Status:</b></td><td>${order.orderStatus}</td></tr>
          </tbody>
        </table>

        <h3 style="margin-top:25px;color:#444;">Total</h3>
        <p style="font-size:18px;font-weight:600;">₦${order.amount.toLocaleString()}</p>

        <p style="font-size:13px;color:#777;margin-top:24px;">You can track your order in your account dashboard.</p>
      </div>

      <div style="background:#ff6600;color:#fff;text-align:center;padding:12px;font-size:12px;">
        <p style="margin:0;">&copy; ${new Date().getFullYear()} CuscedaNG</p>
      </div>
    </div>
  </div>
  `;
}
