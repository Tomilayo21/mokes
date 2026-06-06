import connectDB from "@/config/db";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======================================================
// POST — Create a message (text, files, or both)
// ======================================================
export async function POST(req) {
  try {
    await connectDB();

    // 🔥 Get logged-in user from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = session.user.id;
    const contentType = req.headers.get("content-type") || "";
    let messageData = { senderId, read: false };

    // --------------------------------------------------
    // 🔥 FORM-DATA (file uploads)
    // --------------------------------------------------
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const chatId = formData.get("chatId");
      const text = formData.get("text");

      const files = formData.getAll("files");
      const uploadedUrls = [];

      // Upload each file to Cloudinary
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());

        const uploaded = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "chat_uploads" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        uploadedUrls.push(uploaded.secure_url);
      }

      messageData = {
        ...messageData,
        chatId,
        text,
        attachments: uploadedUrls,
      };

    } else {
      // --------------------------------------------------
      // 🔥 JSON BODY (no files)
      // --------------------------------------------------
      const body = await req.json();
      messageData = { ...messageData, ...body };
    }

    // Save message
    const message = await Message.create(messageData);
    return NextResponse.json(message, { status: 201 });

  } catch (err) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// ======================================================
// GET — Get all messages
// ======================================================
export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find().sort({ createdAt: 1 });
    return NextResponse.json(messages);
  } catch (err) {
    console.error("GET /api/messages error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
