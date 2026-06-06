import nodemailer from "nodemailer";
import ContactMokes from "@/models/ContactMokes";
import connectDB from "@/config/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    // 1. Save to MongoDB
    await connectDB();
    await ContactMokes.create({ name, email, subject, message, archived: false });

    // 2. Send Email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `Customer Inquiry: ${subject}`,
      html: `
        <h2>You've Received a New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });


    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Submit error:", error);
    return new Response(JSON.stringify({ error: "Failed to submit message" }), { status: 500 });
  }
}
