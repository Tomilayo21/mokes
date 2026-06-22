import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import UserSettings from "@/models/UserSettings";
import nodemailer from "nodemailer";

export async function POST(req) {
  await connectDB();

  // Clerk sends signature headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const body = await req.text();

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;

  // Handle user login events
  if (eventType === "user.signed_in") {
    const userId = evt.data.id;
    const emailAddress = evt.data.email_addresses?.[0]?.email_address;

    if (userId && emailAddress) {
      // check if login alerts are enabled
      const settings = await UserSettings.findOne({ userId });
      if (settings?.loginAlerts) {
        // send email
        await sendLoginAlertEmail(emailAddress);
      }
    }
  }

  return NextResponse.json({ success: true });
}

// Helper to send email
async function sendLoginAlertEmail(to) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // or your provider
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Security Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "New Device Login Detected",
    text: "A new device just signed in to your account. If this wasn’t you, secure your account immediately.",
    html: `<p>A new device just signed in to your account.</p>
           <p>If this wasn’t you, <a href="https://yourapp.com/security">secure your account</a> immediately.</p>`,
  });
}
