
import connectDB from "@/config/db";
import Settings from "@/models/Settings";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(body);
    } else {
      Object.assign(settings, body);
    }

    await settings.save();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Failed to update settings:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne();
    return new Response(JSON.stringify(settings), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch settings" }), { status: 500 });
  }
}