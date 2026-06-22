import connectDB from "@/config/db";
import Address from "@/models/Address";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params; // ✅ FIX

    await Address.findByIdAndDelete(id);

    return new Response(
      JSON.stringify({ message: "Address deleted" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error deleting address" }),
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params; // ✅ FIX

    const body = await req.json();

    const updated = await Address.findByIdAndUpdate(
      id,
      body,
      { returnDocument: "after" } 
    );

    return new Response(
      JSON.stringify({
        success: true,
        updatedAddress: updated
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error updating address" }),
      { status: 500 }
    );
  }
}