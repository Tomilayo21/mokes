import nodemailer from "nodemailer";

export async function sendVerificationEmail(to, token) {
  try {
    // ✅ Yahoo SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Verification link
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

    // ✅ Send email
    const info = await transporter.sendMail({
      from: `"Perfect Home" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify Your Email - Perfect Home Premium Real Estate",
      html: `
        <div style="max-width: 600px; margin: 40px auto; padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; font-family: 'Segoe UI', sans-serif; color: #333;">
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Welcome to Perfect Home Premium Real Estate</h2>
          
          <p>Thank you for signing up, we just need to verify your email before you can log in.</p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Verify My Email
            </a>
          </div>

          <p style="font-size: 14px; margin-top: 20px;">Or copy this link into your browser:</p>
          <p style="font-size: 13px; color: #555;">${verifyUrl}</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />

          <div style="text-align: center; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} Perfect Home Premium Real Estate. All rights reserved.
          </div>
        </div>
      `,
    });

    console.log("✅ Verification email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send verification email:", err);
    throw new Error("Failed to send verification email");
  }
}