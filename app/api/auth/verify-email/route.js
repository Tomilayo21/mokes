import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

function renderPage(title, message, isSuccess = false) {
  return new NextResponse(
    `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f4f6f8;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: white;
              padding: 30px;
              max-width: 420px;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 {
              color: ${isSuccess ? "#16a34a" : "#dc2626"};
              font-size: 1.8rem;
              margin-bottom: 10px;
            }
            p {
              color: #374151;
              font-size: 1rem;
              margin-bottom: 20px;
            }
            a {
              background: #3b82f6;
              padding: 12px 18px;
              color: white;
              font-size: 0.95rem;
              border-radius: 6px;
              text-decoration: none;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${title}</h1>
            <p>${message}</p>
            <a href="/signup">Go to Signup Page</a>
          </div>
        </body>
      </html>
    `,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return renderPage(
        "Invalid Link",
        "The verification link is invalid or incomplete."
      );
    }

    const user = await User.findById(token);
    if (!user) {
      return renderPage(
        "User Not Found",
        "We could not find an account associated with this verification link."
      );
    }

    if (user.emailVerified) {
      return renderPage(
        "Already Verified",
        "Your email has already been verified.",
        true
      );
    }

    user.emailVerified = true;
    await user.save();

    return renderPage(
      "Email Verified!",
      "Your email has been successfully verified. You may now log into your account.",
      true
    );
  } catch (err) {
    console.error("🔥 [VERIFY_EMAIL_ERROR]", err);
    return renderPage(
      "Verification Failed",
      "An unexpected error occurred while verifying your email."
    );
  }
}