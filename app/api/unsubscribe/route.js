import connectDB from "@/config/db";
import Subscriber from "@/models/Subscriber";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
  }

  try {
    const deleted = await Subscriber.findOneAndDelete({ email });
    if (!deleted) {
      return new Response(JSON.stringify({ message: "No subscriber found with this email." }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Unsubscribed successfully." }), { status: 200 });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return new Response(JSON.stringify({ message: "Internal server error." }), { status: 500 });
  }
}
