import connectDB from "@/config/db";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne({});

    if (!settings) {
      return Response.json({}, { status: 200 });
    }

    return Response.json(settings, { status: 200 });

  } catch (err) {
    console.error("GET /api/settings error:", err);
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
