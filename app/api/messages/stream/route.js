// pages/api/messages/stream.js or /app/api/messages/stream/route.js (for App Router)
import connectDB from "@/config/db";
import Message from "@/models/Message";

let clients = [];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = async () => {
        await connectDB();
        // const msgs = await Message.find({ chatId }).sort({ createdAt: 1 });
        const raw = await Message.find({ chatId }).sort({ createdAt: 1 });

        // ensure every message has a status
        const msgs = raw.map((m) => ({
            _id: m._id,
            content: m.content,
            senderName: m.senderName,
            isAdmin: m.isAdmin,
            chatId: m.chatId,
            status: m.status || "sent", // fallback for legacy messages
            createdAt: m.createdAt,
        }));
        controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(msgs)}\n\n`)
        );

      };

      send();
      const interval = setInterval(send, 3000); // Can be removed if triggering via message save
      clients.push({ controller, chatId });

      const close = () => {
        clearInterval(interval);
        controller.close();
        clients = clients.filter((c) => c.controller !== controller);
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
