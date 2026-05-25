import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authAdmin";

export async function GET(request) {
  try {
    // Authenticate and ensure admin access
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser; 

    await connectDB();

    const products = await Product.find({});
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
