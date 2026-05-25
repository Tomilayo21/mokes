
// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import { hashPassword } from "@/utils/auth";
import { logActivity } from "@/utils/logActivity";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";

// Validate password strength
function validatePasswordRules(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must include an uppercase letter");
  if (!/[!@#$%^&*(),.?\":{}|<>[\]\\\/~`+=;:_-]/.test(password)) errors.push("Password must include a special character");
  return errors;
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, username, email, password, verifyPassword } = body;

    const fieldErrors = {};

    // 1️⃣ Basic presence validation
    if (!name) fieldErrors.name = "Full name is required";
    if (!username) fieldErrors.username = "Username is required";
    if (!email) fieldErrors.email = "Email is required";
    if (!password) fieldErrors.password = "Password is required";
    if (!verifyPassword) fieldErrors.verifyPassword = "Please confirm your password";

    // Return immediately if missing fields
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json({ error: "Missing required fields", fieldErrors }, { status: 400 });
    }

    // 2️⃣ Password match
    if (password !== verifyPassword) {
      fieldErrors.verifyPassword = "Passwords do not match";
      return NextResponse.json({ error: "Passwords do not match", fieldErrors }, { status: 400 });
    }

    // 3️⃣ Password strength
    const passRules = validatePasswordRules(password);
    if (passRules.length > 0) {
      fieldErrors.password = passRules.join(". ");
      return NextResponse.json({ error: "Weak password", fieldErrors }, { status: 400 });
    }

    // 4️⃣ Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      fieldErrors.email = "Please enter a valid email address";
      return NextResponse.json({ error: "Invalid email", fieldErrors }, { status: 400 });
    }

    // 5️⃣ Username format (alphanumeric + underscore, 3–30 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      fieldErrors.username = "Username must be 3–30 characters (letters, numbers, underscore)";
      return NextResponse.json({ error: "Invalid username", fieldErrors }, { status: 400 });
    }

    // 6️⃣ Duplicate checks
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    const duplicateErrors = [];

    if (existingEmail) {
      fieldErrors.email = "Email already in use";
      duplicateErrors.push("email");
    }
    if (existingUsername) {
      fieldErrors.username = "Username already taken";
      duplicateErrors.push("username");
    }

    if (duplicateErrors.length > 0) {
      const duplicateMessage =
        duplicateErrors.length === 1
          ? `${duplicateErrors[0][0].toUpperCase() + duplicateErrors[0].slice(1)} already exists`
          : duplicateErrors.map((f) => f[0].toUpperCase() + f.slice(1)).join(" and ") + " already exist";

      return NextResponse.json({ error: duplicateMessage, fieldErrors }, { status: 400 });
    }

    // 7️⃣ Hash password
    const passwordHash = await hashPassword(password);
    const userId = Date.now().toString();

    // 8️⃣ Create user
    const user = await User.create({
      _id: userId,
      username,
      name,
      email,
      passwordHash,
      emailVerified: false,
    });

    // 9️⃣ Send verification email
    await sendVerificationEmail(user.email, user._id);

    // 🔟 Log signup activity
    await logActivity({
      type: "user",
      action: "Signed Up (verification pending)",
      entityId: user._id.toString(),
      userId: user._id.toString(),
      changes: { username: user.username, email: user.email, name: user.name },
    });

    // ✅ Success response
    return NextResponse.json(
      {
        success: true,
        message: "Account created! Please check your email to verify before logging in.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("🔥 [SIGNUP_ERROR]", err);
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 500 });
  }
}
