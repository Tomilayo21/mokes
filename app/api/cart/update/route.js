// import connectDB from "@/config/db";
// import User from "@/models/User";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/authOptions";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.email) {
//       return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
//     }

//     const { cartData } = await request.json();

//     await connectDB();

//     // Find user by email (or by ID if you store it in session)
//     const user = await User.findOne({ email: session.user.email });
//     if (!user) {
//       return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
//     }

//     // Save cart data
//     user.cartItems = cartData || {};
//     await user.save();

//     return NextResponse.json({ success: true, cartItems: user.cartItems });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }




















































import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { cartItems } = await req.json();

    await User.findByIdAndUpdate(
      session.user.id,
      {
        cartItems,
      },
      {
        returnDocument: "after",
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}