import { v2 as cloudinary } from "cloudinary";
import Settings from "@/models/Settings";
import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import os from "os";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload or update
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");
    const platform = formData.get("platform");
    const url = formData.get("url");

    if (!file || !platform || !url) {
      return NextResponse.json(
        { error: "File, platform, and URL are required" },
        { status: 400 }
      );
    }

    // Save file temporarily to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(os.tmpdir(), file.name);
    await writeFile(filePath, buffer);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "social-icons",
      resource_type: "image",
    });

    // Save or update in DB
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        socialLinks: [{ platform, url, iconUrl: uploadResult.secure_url }],
      });
    } else {
      const existingIndex = settings.socialLinks.findIndex(
        (link) => link.platform.toLowerCase() === platform.toLowerCase()
      );
      if (existingIndex !== -1) {
        settings.socialLinks[existingIndex] = {
          platform,
          url,
          iconUrl: uploadResult.secure_url,
        };
      } else {
        settings.socialLinks.push({
          platform,
          url,
          iconUrl: uploadResult.secure_url,
        });
      }
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Social icon uploaded and settings updated",
      socialLinks: settings.socialLinks,
    });
  } catch (error) {
    console.error("Upload + Save Error:", error);
    return NextResponse.json(
      { error: "Failed to upload icon and save settings" },
      { status: 500 }
    );
  }
}

// Delete
export async function DELETE(req) {
  try {
    await connectDB();
    const { platform } = await req.json();

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    let settings = await Settings.findOne();
    if (!settings) {
      return NextResponse.json(
        { error: "No settings found" },
        { status: 404 }
      );
    }

    // Remove link with matching platform
    settings.socialLinks = settings.socialLinks.filter(
      (link) => link.platform.toLowerCase() !== platform.toLowerCase()
    );

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Social link deleted",
      socialLinks: settings.socialLinks,
    });
  } catch (error) {
    console.error("Delete Social Link Error:", error);
    return NextResponse.json(
      { error: "Failed to delete social link" },
      { status: 500 }
    );
  }
}
