// /app/api/user/[id]/route.js
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET(req, { params }) {
  await connectDB();
  const user = await User.findById(params.id);
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(user), { status: 200 });
}

export async function PUT(req, { params }) {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    params.id,
    { welcomeSent: true },
    { new: true }
  );
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
