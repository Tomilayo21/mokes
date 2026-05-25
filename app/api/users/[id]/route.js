// app/api/users/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/authAdmin";
import { logActivity } from "@/utils/logActivity";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = params; 
    const body = await req.json();
    const { role } = body;

    if (!role || !["admin", "user", "seller"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function DELETE(req, { params }) {
  const adminOrResponse = await requireAdmin(req);
  if (adminOrResponse instanceof NextResponse) return adminOrResponse;
  const adminUser = adminOrResponse;

  const { id } = params;
  await connectDB();
  const user = await User.findByIdAndDelete(id).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await logActivity({
    type: "user",
    action: "Deleted user",
    entityId: user._id.toString(),
    userId: adminUser._id?.toString?.() ?? adminUser.id,
    changes: { username: user.username, email: user.email },
  });

  return NextResponse.json({ success: true });
}
