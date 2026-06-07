import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { token } = await req.json();

    const user = await User.findById(session.user.id);

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // remove device
    user.sessions = user.sessions.filter(
      (s) => s.token !== token
    );

    // invalidate JWT sessions
    user.sessionVersion = (user.sessionVersion || 0) + 1;

    await user.save();

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to remove session" },
      { status: 500 }
    );
  }
}