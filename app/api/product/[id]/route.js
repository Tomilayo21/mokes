import connectDB from "@/config/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/authAdmin";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { Readable } from "stream";

export const config = {
  api: { bodyParser: false },
};

// ✅ Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// ✅ PUBLIC FETCH (no admin check)
export async function GET(req) {
  await connectDB();

  try {
    const products = await Product.find({ stock: { $gt: 0 }, visible: true });
    return NextResponse.json({ success: true, products });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ DELETE (Admin only)
export async function DELETE(request, { params }) {
  await connectDB();

  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  const { id } = params;

  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ PATCH (toggle visibility)
export async function PATCH(request, { params }) {
  await connectDB();

  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  const { id } = params;
  const body = await request.json();

  try {
    if (body.toggleVisibility) {
      const product = await Product.findById(id);
      if (!product) {
        return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
      }

      product.visible = !product.visible;
      await product.save();

      return NextResponse.json({
        success: true,
        message: "Product visibility toggled",
        visible: product.visible,
      });
    }

    return NextResponse.json({ success: false, message: "Missing toggleVisibility flag" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ✅ PUT (Admin edit)
export async function PUT(request, { params }) {
  await connectDB();

  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  const { id } = params;

  try {
    const contentType = request.headers.get("content-type");

    // 📦 JSON = stock update
    if (contentType?.includes("application/json")) {
      const body = await request.json();
      const { stock } = body;

      const updatedProduct = await Product.findByIdAndUpdate(id, { stock }, { new: true });
      if (!updatedProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, product: updatedProduct });
    }

    // 🖼 multipart/form-data = full product edit
    const formData = await request.formData();
    const name = formData.get("name");
    const category = formData.get("category");
    const brand = formData.get("brand");
    const color = formData.get("color");
    const price = Number(formData.get("price"));
    const offerPrice = Number(formData.get("offerPrice"));
    const stock = Number(formData.get("stock"));
    const visible = formData.get("visible") === "true";
    const description = formData.get("description");
    const existingImages = JSON.parse(formData.get("existingImages") || "[]");
    const newImages = formData.getAll("newImages");

    let uploadedImageUrls = [];

    for (const file of newImages) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const stream = bufferToStream(buffer);

      const uploadResult = await new Promise((resolve, reject) => {
        const streamUpload = cloudinary.uploader.upload_stream(
          { folder: "products", resource_type: "image" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.pipe(streamUpload);
      });

      uploadedImageUrls.push(uploadResult.secure_url);
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        brand,
        color,
        price,
        offerPrice,
        stock,
        visible,
        description,
        image: [...existingImages, ...uploadedImageUrls],
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
