import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  try {
    console.log("📨 Setting up transporter with host:", process.env.EMAIL_HOST);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true, // Yahoo requires SSL on port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("✅ Transporter created. Sending mail to:", to);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // MUST match the authenticated Yahoo account
      to,
      subject,
      html,
    });

    console.log("✅ Email sent to:", to, "Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw error;
  }
}
