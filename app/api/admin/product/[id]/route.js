import connectDB from "@/config/db";
import Clothing from "@/models/Clothing";
import { requireAdmin } from "@/lib/authAdmin";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

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

export async function DELETE(req, { params }) {
  await connectDB();

  const adminUser = await requireAdmin(req);
  if (adminUser instanceof NextResponse) return adminUser;

  try {
    const deleted = await Clothing.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  await connectDB();

  const adminUser = await requireAdmin(req);
  if (adminUser instanceof NextResponse) return adminUser;

  try {
    const body = await req.json();

    const product = await Clothing.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (body.toggleVisibility) {
      product.visible = !product.visible;
      await product.save();

      return NextResponse.json({
        success: true,
        visible: product.visible,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false,
        message: err.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  await connectDB();

  const adminUser = await requireAdmin(req);
  if (adminUser instanceof NextResponse) return adminUser;

  try {
    const formData = await req.formData();

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
    const sizes = JSON.parse(formData.get("sizes") || "[]");
    const subcategory = formData.get("subcategory");

    const product = await Clothing.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // ✅ slug update
    let slug = product.slug;

    if (name && name.trim() !== product.name.trim()) {
      const base = slugify(name, { lower: true, strict: true });
      slug = `${base}-${Math.floor(Math.random() * 10000)}`;
    }

    // upload images
    let uploadedImages = [];

    for (const file of newImages) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const upload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (err, result) => (result ? resolve(result) : reject(err))
        );

        bufferToStream(buffer).pipe(stream);
      });

      uploadedImages.push(upload.secure_url);
    }

    const updated = await Clothing.findByIdAndUpdate(
      params.id,
      {
        name,
        category,
        brand,
        color,
        price,
        offerPrice,
        visible,
        description,
        subcategory,
        sizes,
        slug,
        image: [...existingImages, ...uploadedImages],
      },
      { new: true }
    );

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false,
        message: err.message
      },
      { status: 500 }
    );
  }
}