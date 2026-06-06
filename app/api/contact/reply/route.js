import connectDB from "@/config/db";
import ReplyMokes from "@/models/ReplyMokes";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const { to, cc, subject, message, originalMessageId } = body;

  if (!to || !subject || !message || !originalMessageId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const reply = await ReplyMokes.create({ to, cc, subject, message, originalMessageId });

  // ✅ Yahoo Mail SMTP setup
  const transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
    from: `"Perfect Home Premium Real Estate Support" <${process.env.EMAIL_USER}>`,
    to,
    cc,
    subject: `${subject}`, 
    text: `Hello,

    Thank you for contacting Perfect Home Premium Real Estate. Below is our response to your inquiry:

    Subject: ${subject}

    ${message}

    If you have any further questions or concerns, feel free to reach out again.

    Best regards,
    Perfect Home Premium Real Estate Support Team`,
        html: `
          <div style="max-width: 600px; margin: 40px auto; padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; font-family: 'Segoe UI', sans-serif; color: #333;">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">🛠️ Support Response from Perfect Home Premium Real Estate</h2>
            
            <div style="margin: 30px 0; background: #f9f9f9; border-left: 4px solid #9CA3AF; padding: 20px;">
              <p style="margin-top: 5px; font-size: 15px; white-space: pre-wrap;">${message}</p>
            </div>

            <p style="font-size: 14px; margin-top: 30px;">
              If you need further assistance or have more questions, don’t hesitate to reply to this email. We’re here to help.
            </p>

            <div style="text-align: center; margin: 40px 0 20px;">
              <a href="https://cusceda.ng/contact" style="background-color: #9CA3AF; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Contact Support</a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />

            <div style="text-align: center;">
              <p style="font-size: 13px; margin-bottom: 10px;">Stay connected:</p>
              <p>
                <a href="https://facebook.com/cusceda" style="margin: 0 10px;"><img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" width="24" /></a>
                <a href="https://twitter.com/cusceda" style="margin: 0 10px;"><img src="https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg" alt="Twitter" width="24" /></a>
                <a href="https://instagram.com/cusceda" style="margin: 0 10px;"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" width="24" /></a>
                <a href="https://linkedin.com/company/cusceda" style="margin: 0 10px;"><img src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg" alt="LinkedIn" width="24" /></a>
              </p>
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                &copy; ${new Date().getFullYear()} Perfect Home Premium Real Estate. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Email send failed:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const messageId = searchParams.get("messageId");

  if (messageId) {
    const replies = await ReplyMokes.find({ originalMessageId: messageId }).sort({ sentAt: -1 });
    return NextResponse.json({ replies });
  }

  // Return all replies if no messageId is provided (for "Replies" tab)
  const replies = await ReplyMokes.find().sort({ sentAt: -1 });
  return NextResponse.json({ replies });
}

export async function PATCH(req) {
  await connectDB();
  const { replyId, status } = await req.json();

  if (!replyId || !["active", "deleted"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const reply = await ReplyMokes.findByIdAndUpdate(replyId, { status }, { new: true });

  if (!reply) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, reply });
}

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    await ReplyMokes.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
