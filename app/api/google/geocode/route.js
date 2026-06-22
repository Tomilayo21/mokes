import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const place_id = searchParams.get("place_id");

  try {
    console.log("GOOGLE KEY:", process.env.GOOGLE_MAPS_KEY);

    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          place_id,
          key: process.env.GOOGLE_MAPS_KEY,
        },
      }
    );

    return NextResponse.json(res.data);
  } catch (error) {
    console.log("GEOCODE ERROR:", error.response?.data || error.message);

    return NextResponse.json(
      { error: "Geocode failed" },
      { status: 500 }
    );
  }
}