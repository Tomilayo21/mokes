import nodemailer from "nodemailer";
import ContactMokes from "@/models/ContactMokes";
import connectDB from "@/config/db";
import { UAParser } from "ua-parser-js";
import fetch from "node-fetch";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message, gpsLocation } = body;

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    await connectDB();

    // -------------------------
    // USER AGENT + DEVICE
    // -------------------------
    const userAgent = req.headers.get("user-agent") || "";

    const parser = new UAParser(userAgent);

    const device = `${parser.getBrowser().name || "Unknown Browser"} on ${
      parser.getOS().name || "Unknown OS"
    }`;

    // -------------------------
    // IP DETECTION
    // -------------------------
    const forwardedFor = req.headers.get("x-forwarded-for");

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      "";

    console.log("REAL IP:", ip);

    // -------------------------
    // IP LOCATION (FALLBACK)
    // -------------------------
    let ipLocation = "Unknown";

    try {
      const isPrivateIp =
        !ip ||
        ip.startsWith("127.") ||
        ip.startsWith("10.") ||
        ip.startsWith("192.168.") ||
        ip.startsWith("172.");

      if (!isPrivateIp) {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();

        if (data?.city) {
          ipLocation = `${data.city}, ${data.region}, ${data.country_name}`;
        }
      }
    } catch (err) {
      console.log("IP lookup failed:", err.message);
    }

    // -------------------------
    // HYBRID LOCATION LOGIC
    // -------------------------
    let location = {
      gps: gpsLocation || null,
      ip: ipLocation,
      accuracy: gpsLocation ? "gps" : "ip",

      // 👇 THIS is what you are missing
      label: gpsLocation
        ? gpsLocation.address || gpsLocation.city || ipLocation
        : ipLocation,
    };

    // -------------------------
    // SAVE TO DB
    // -------------------------
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

    // -------------------------
    // EMAIL
    // -------------------------
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const safeMessage = message
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    const mailOptions = {
      from: `"MOKÉS Website" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission — ${subject}`,
      html: `
        <div style="
          max-width: 640px;
          margin: 40px auto;
          padding: 40px;
          font-family: Arial, sans-serif;
          background-color: #ffffff;
          border: 1px solid #e5e5e5;
          color: #1f2937;
        ">

          <!-- Header -->
          <div style="margin-bottom: 32px; text-align: center;">
            <h1 style="
              margin: 0;
              font-size: 24px;
              font-weight: 600;
              color: #111827;
              letter-spacing: -0.02em;
            ">
              New Contact Form Submission
            </h1>

            <p style="
              margin-top: 10px;
              font-size: 14px;
              line-height: 1.6;
              color: #6b7280;
            ">
              A new inquiry has been submitted through the MOKÉS website contact form.
            </p>
          </div>

          <!-- Details -->
          <div style="
            border-top: 1px solid #f0f0f0;
            border-bottom: 1px solid #f0f0f0;
            padding: 24px 0;
          ">

            <div style="margin-bottom: 18px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em;">
                Name
              </p>

              <p style="margin: 6px 0 0; font-size: 15px; color: #111827;">
                ${name}
              </p>
            </div>

            <div style="margin-bottom: 18px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em;">
                Email Address
              </p>

              <p style="margin: 6px 0 0; font-size: 15px; color: #111827;">
                ${email}
              </p>
            </div>

            <div style="margin-bottom: 18px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em;">
                Subject
              </p>

              <p style="margin: 6px 0 0; font-size: 15px; color: #111827;">
                ${subject}
              </p>
            </div>

            <div style="margin-bottom: 18px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em;">
                Device Information
              </p>

              <p style="margin: 6px 0 0; font-size: 15px; color: #111827;">
                ${device}
              </p>
            </div>

           <div style="margin-bottom: 18px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase;">
                Location
              </p>

              <p style="margin: 6px 0 0; font-size: 15px; color: #111827;">
                ${location.label}
              </p>

              <p style="margin: 6px 0 0; font-size: 13px; color: #6b7280;">
                IP: ${location.ip}
              </p>

              <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">
                Source: ${location.accuracy}
              </p>
            </div>

            <div>
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em;">
                Message
              </p>

              <div style="
                margin-top: 10px;
                padding: 18px;
                background-color: #f9fafb;
                border: 1px solid #eeeeee;
                font-size: 15px;
                line-height: 1.8;
                color: #111827;
                white-space: pre-line;
              ">
                ${safeMessage}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="
            margin-top: 28px;
            text-align: center;
            font-size: 13px;
            line-height: 1.7;
            color: #9ca3af;
          ">
            <p style="margin: 0;">
              This email was automatically generated from the MOKÉS contact form.
            </p>

            <p style="margin-top: 10px;">
              &copy; ${new Date().getFullYear()} MOKÉS. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Submit error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to submit message" }),
      { status: 500 }
    );
  }
}