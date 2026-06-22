import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    const res = await axios.post(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        input,
        includedRegionCodes: ["ng"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
        },
      }
    );

    const suggestions = res.data.suggestions || [];

    return NextResponse.json({
      predictions: suggestions.map((s) => ({
        place_id: s.placePrediction?.placeId,
        description: s.placePrediction?.text?.text,
      })),
    });
  } catch (err) {
    console.log(err.response?.data || err.message);
    return NextResponse.json({ predictions: [] });
  }
}