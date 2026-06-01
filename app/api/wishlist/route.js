// app/api/wishlist/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Wishlist from "@/models/Wishlist";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/* ---------------- GET (Watch Later list) ---------------- */
export async function GET(req) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    const items = await Wishlist.find({
      userId: session.user.id,
    }).populate("productId");

    const clean = items.filter(
      (i) => i.productId && i.productId._id
    );

    return NextResponse.json(clean);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

/* ---------------- TOGGLE (Add/Remove) ---------------- */
export async function POST(req) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const userId = session.user.id;

    const existing = await Wishlist.findOne({ userId, productId });

    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      return NextResponse.json({ removed: true });
    }

    const newItem = await Wishlist.create({ userId, productId });

    return NextResponse.json({ added: true, item: newItem });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}