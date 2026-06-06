import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import ContactMokes from "@/models/ContactMokes";

export async function PATCH(req, { params }) {
  const { id } = await params;
  await connectDB();
  const body = await req.json();

  try {
    await ContactMokes.findByIdAndUpdate(id, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params; 
  await connectDB();

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";

  try {
    if (force) {
      await ContactMokes.findByIdAndDelete(id);
    } else {
      await ContactMokes.findByIdAndUpdate(id, { deleted: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

