import connectDB from "@/config/db";
import Clothing from "@/models/Clothing";
import { requireAdmin } from "@/lib/authAdmin";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import slugify from "slugify";

// export const config = {
//   api: { bodyParser: false },
// };

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
    const products = await Clothing.find({ visible: true });

    const filtered = products.filter((p) => {
      const totalStock = (p.sizes || []).reduce(
        (sum, s) => sum + (s.stock || 0),
        0
      );

      return totalStock > 0;
    });
    return NextResponse.json({ success: true, products:filtered });
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

      if (body.sizes) {
        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { sizes: body.sizes },
          { new: true }
        );

        return NextResponse.json({ success: true, product: updatedProduct });
      }

      return NextResponse.json(
        { success: false, message: "Only sizes update is allowed" },
        { status: 400 }
      );
    }

    // 🖼 multipart/form-data = full product edit
    const formData = await request.formData();
    const name = formData.get("name");
    const category = formData.get("category");
    const brand = formData.get("brand");
    const color = formData.get("color");
    const price = Number(formData.get("price"));
    const offerPrice = Number(formData.get("offerPrice"));
    const visible = formData.get("visible") === "true";
    const description = formData.get("description");
    const existingImages = JSON.parse(formData.get("existingImages") || "[]");
    const newImages = formData.getAll("newImages");
    const sizes = JSON.parse(
      formData.get("sizes") || "[]"
    );
    const subcategory = formData.get("subcategory");

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    let slug = existingProduct.slug;

    if (name?.trim() && name.trim() !== existingProduct.name.trim()) {
      const baseSlug = slugify(name.trim(), {
        lower: true,
        strict: true,
      });

      const random = Math.floor(Math.random() * 10000);
      slug = `${baseSlug}-${random}`;
    }

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
        subcategory,
        sizes,
        brand,
        color,
        slug,
        price,
        offerPrice,
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
