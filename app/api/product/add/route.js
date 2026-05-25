import connectDB from "@/config/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/authAdmin";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // ✅ Verify admin
    const adminUser = await requireAdmin(request);

    // If requireAdmin returned a NextResponse (forbidden/unauthorized)
    if (adminUser instanceof NextResponse) {
      return adminUser;
    }

    // If no user found at all
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const color = formData.get("color");
    const brand = formData.get("brand");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stock = formData.get("stock");
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files uploaded!" },
        { status: 400 }
      );
    }

    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid stock value" },
        { status: 400 }
      );
    }

    // ✅ Upload images to Cloudinary
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      })
    );

    const imageUrls = uploadResults.map((res) => res.secure_url);

    await connectDB();

    const newProduct = await Product.create({
      userId: adminUser.id, // ✅ NextAuth admin ID
      name,
      description,
      category,
      color,
      brand,
      price: Number(price),
      offerPrice: Number(offerPrice),
      stock: Number(stock),
      image: imageUrls,
      date: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Product uploaded successfully!",
      product: newProduct,
    });
  } catch (error) {
    console.error("[PRODUCT_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
