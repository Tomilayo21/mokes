import nodemailer from "nodemailer";
import ContactMokes from "@/models/ContactMokes";
import connectDB from "@/config/db";
import { UAParser } from "ua-parser-js";
import fetch from "node-fetch";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
      });
    }

    await connectDB();

    // Get user-agent and IP
    const userAgent = req.headers.get("user-agent") || "";
    const ip =
      req.headers.get("x-vercel-forwarded-for") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "127.0.0.1";

    // Parse device info
    const parser = new UAParser(userAgent);
    const device = `${parser.getBrowser().name} on ${parser.getOS().name}`;

    // Location lookup
    const isLocal =
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip === "8.8.8.8";
      let location = "Unknown";

      if (!isLocal) {
        try {
          const res = await fetch(
            `https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`
          );

          if (res.ok) {
            const data = await res.json();

            const { city, region, country } = data || {};

            location = [city, region, country]
              .filter(Boolean)
              .join(", ") || "Unknown";
          }
        } catch (err) {
          console.warn("IP lookup failed:", err.message);
        }
      }

    // Save to DB
    await ContactMokes.create({
      name,
      email,
      subject,
      message,
      device,
      location,
      archived: false,
      read: false,
      deleted: false,
    });

    // Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Customer Inquiry: ${subject}`,
      html: `
        <div style="max-width: 600px; margin: 30px auto; padding: 30px; font-family: Arial, sans-serif; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2c3e50;">📬 New Message Received</h2>
            <p style="font-size: 14px; color: #777;">A customer has submitted an inquiry via the website contact form.</p>
          </div>

          <div style="font-size: 15px; line-height: 1.6;">
            <p><strong>👤 Name:</strong> ${name}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>🎯 Subject:</strong> ${subject}</p>
            <p><strong>💻 Device:</strong> ${device}</p>
            <p><strong>📍 Location:</strong> ${location}</p>
            <p><strong>📝 Message:</strong><br/>${message}</p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

          <div style="text-align: center; font-size: 13px; color: #999;">
            <p>You received this message because someone submitted the contact form on your website.</p>
            <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Perfect Home Premium Real Estate. All rights reserved.</p>
          </div>
        </div>
      `,
    };


    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Submit error:", error);
    return new Response(JSON.stringify({ error: "Failed to submit message" }), {
      status: 500,
    });
  }
}
