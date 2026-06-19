// app/api/user/get-address/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const addresses = await Address.find({ userId: session.user.id }).lean();

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Server error",
    });
  }
}
