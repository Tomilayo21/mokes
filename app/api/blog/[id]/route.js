import connectDB from '@/config/db';
import MokesBlog from '@/models/MokesBlog';

export async function PUT(req, context) {
  await connectDB();

  const { id } = context.params;
  const body = await req.json();

  const post = await MokesBlog.findByIdAndUpdate(
    id,
    body,
    { returnDocument: "after" }
  );

  return new Response(JSON.stringify({ post }), { status: 200 });
}

export async function DELETE(req, context) {
  await connectDB();

  const { id } = context.params;

  await MokesBlog.findByIdAndDelete(id);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}


