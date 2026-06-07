import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id).lean();

    return Response.json({
      sessions: user?.sessions || [],
    });
  } catch (err) {
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}