// app/api/favorites/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Favorite from '@/models/Favorite';
import Wishlist from '@/models/Wishlist'; 

export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json([], { status: 200 });
    }

    const favorites = await Wishlist.find({ userId }).populate("productId");

    // 🔥 HARD CLEAN (this prevents empty UI + crashes)
    const clean = favorites.filter(
      (f) => f.productId && f.productId._id
    );

    return NextResponse.json(clean);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();

  try {
    const { productId, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const existing = await Wishlist.findOne({ userId, productId });

    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      return NextResponse.json({ removed: true }, { status: 200 });
    }

    const newFav = await Wishlist.create({ userId, productId });
    return NextResponse.json({ favorite: newFav }, { status: 201 });
  } catch (error) {
    console.error('Favorite POST error:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    // ✅ Extract from URL
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId"); // optional if included

    if (!productId) {
      return new Response(JSON.stringify({ error: "Missing productId" }), {
        status: 400,
      });
    }

    // ✅ You should identify user either from session or token
    await Wishlist.findOneAndDelete({ productId, userId });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("DELETE favorite failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to remove favorite" }),
      { status: 500 }
    );
  }
}