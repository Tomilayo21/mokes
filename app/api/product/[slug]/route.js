//app\api\product\[slug]\route.js
import connectDB from "@/config/db";
import Clothing from "@/models/Clothing";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();

  try {
    const { slug } = await params;

    console.log("slug:", slug);

    const product = await Clothing.findOne({ slug });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}