import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/config/db";
import Address from "@/models/Address";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const { address } = await req.json();
    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address data is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ Save address linked to authenticated user
    const newAddress = new Address({
      ...address,
      userId: session.user.id,
    });
    await newAddress.save();

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      addressId: newAddress._id,
    });
  } catch (error) {
    console.error("Address save error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save address" },
      { status: 500 }
    );
  }
}
