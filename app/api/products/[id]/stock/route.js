// app/api/products/[id]/stock/route.js
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { stock } = await req.json();

    const product = await Product.findByIdAndUpdate(
      params.id,
      { stock },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Stock updated",
      product,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
