import nodemailer from "nodemailer";
import Subscriber from "@/models/Subscriber";
import connectDB from "@/config/db";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();
  const ADMIN_LOCATION = {
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
  };

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
  }

  const existing = await Subscriber.findOne({ email });
  if (existing) {
    return new Response(JSON.stringify({ message: "You’re already subscribed.", alreadySubscribed: true }), { status: 200 });
  }

  const newSubscriber = new Subscriber({ email });
  await newSubscriber.save();

  // Send welcome email
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
      from: `"MOKÉS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to MOKÉS!",
      html: `
      <div style="
        max-width: 600px;
        margin: 40px auto;
        padding: 40px;
        background: #ffffff;
        border: 1px solid #e5e5e5;
        border-radius: 10px;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #111827;
        line-height: 1.6;
      ">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.02em;">
            Welcome to MOKÉS
          </h1>

          <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
            You’re officially on the list. Expect curated drops, early access, and exclusive releases.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <!-- Body -->
        <div style="font-size: 14px; color: #374151;">
          <p style="margin-bottom: 14px;">
            Thank you for subscribing to <strong>MOKÉS</strong>. We’re building a community that gets first access to everything we create.
          </p>

          <p style="margin-bottom: 12px;">
            Here’s what you can expect:
          </p>

          <ul style="padding-left: 18px; margin: 0 0 16px;">
            <li>Early access to new drops</li>
            <li>Limited edition releases</li>
            <li>Subscriber-only offers and updates</li>
          </ul>

          <p style="margin-bottom: 0; color: #6b7280;">
            No spam. Only intentional updates worth your attention.
          </p>
        </div>

        <!-- Subscription Info -->
        <div style="margin-top: 30px;">
          <h3 style="font-size: 15px; margin-bottom: 10px; color: #111827;">
            Subscription Details
          </h3>

          <p style="margin: 0; font-size: 13px; color: #6b7280;">
            Email: <span style="color:#111827;">${email}</span>
          </p>
        </div>

        <!-- Admin Location -->
        <div style="margin-top: 20px;">
          <h3 style="font-size: 15px; margin-bottom: 10px; color: #111827;">
            Our Location
          </h3>

          <p style="margin: 0; font-size: 13px; color: #6b7280;">
            ${ADMIN_LOCATION.city}, ${ADMIN_LOCATION.state}, ${ADMIN_LOCATION.country}
          </p>
        </div>

        <!-- Links -->
        <div style="margin-top: 30px;">
          <h3 style="font-size: 15px; margin-bottom: 10px;">
            Explore MOKÉS
          </h3>

          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
            <li style="margin-bottom: 6px;">
              <a href="https://mokes.vercel.app/" style="color:#111827; text-decoration:none;">
                Shop Latest Collection
              </a>
            </li>
            <li style="margin-bottom: 6px;">
              <a href="https://mokes.vercel.app/" style="color:#111827; text-decoration:none;">
                New Arrivals
              </a>
            </li>
            <li>
              <a href="https://mokes.vercel.app/contact" style="color:#111827; text-decoration:none;">
                Customer Support
              </a>
            </li>
          </ul>
        </div>

        <!-- Footer -->
        <div style="
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        ">
          <p style="margin: 0;">
            If you didn’t subscribe, you can
            <a href="https://mokes.vercel.app/unsubscribe?email=${encodeURIComponent(email)}"
              style="color:#111827; text-decoration: underline;">
              unsubscribe here
            </a>.
          </p>

          <p style="margin-top: 10px;">
            © ${new Date().getFullYear()} MOKÉS. All rights reserved.
          </p>
        </div>

      </div>
      `
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err.message);
    return new Response(JSON.stringify({ message: "Subscription saved, but failed to send welcome email." }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Subscribed successfully!" }), { status: 201 });
}
