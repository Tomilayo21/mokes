// import connectDB from "@/config/db";
// import User from "@/models/User";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/authOptions";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     // Get session from NextAuth
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.email) {
//       return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
//     }

//     await connectDB();

//     // Find the user by email (or by ID if you store it in session)
//     const user = await User.findOne({ email: session.user.email });
//     if (!user) {
//       return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, cartItems: user.cartItems || {} });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }





































import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { cartItems: {} },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);

    return NextResponse.json({
      cartItems: user?.cartItems || {},
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}