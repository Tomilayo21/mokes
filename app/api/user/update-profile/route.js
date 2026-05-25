import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, dataUrl, removeImage } = await req.json(); // dataUrl is optional base64 data url

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // username update & uniqueness check
  if (username && username !== user.username) {
    const existing = await User.findOne({ username });
    if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    user.username = username;
  }

  // remove image
  if (removeImage) {
    if (user.imagePublicId) {
      await cloudinary.v2.uploader.destroy(user.imagePublicId);
      user.imageUrl = null;
      user.imagePublicId = null;
    }
  }

  // new avatar upload (dataUrl expected to be a data URL: data:image/png;base64,...)
  if (dataUrl) {
    // overwrite existing
    const publicId = `avatars/user_${user._id}`;
    const upload = await cloudinary.v2.uploader.upload(dataUrl, {
      public_id: publicId,
      folder: "avatars",
      overwrite: true,
      transformation: [{ width: 600, height: 600, crop: "thumb", gravity: "face" }],
    });
    user.imageUrl = upload.secure_url;
    user.imagePublicId = upload.public_id;
  }

  await user.save();

  return NextResponse.json({
    ok: true,
    user: {
      id: user._id.toString(),
      username: user.username,
      imageUrl: user.imageUrl,
    },
  });
}