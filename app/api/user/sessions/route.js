import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    return Response.json({
      sessions: (user?.sessions || []).sort(
        (a, b) => new Date(b.lastActive) - new Date(a.lastActive)
      ),
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}