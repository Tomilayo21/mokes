// app/api/user/sessions/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/config/db";
import User from "@/models/User";
import { UAParser } from "ua-parser-js";


export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);

    return Response.json({
      sessions:
        user?.sessions?.sort(
          (a, b) =>
            new Date(b.lastActive) -
            new Date(a.lastActive)
        ) || [],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

