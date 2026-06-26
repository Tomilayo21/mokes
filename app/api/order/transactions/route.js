import connectDB from "@/config/db";
import MokesOrder from "@/models/MokesOrder";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range") || "7");

    const now = new Date();
    const startDate = new Date();

    // Normalize to start of day UTC
    startDate.setUTCHours(0, 0, 0, 0);

    // Adjust start date based on range
    startDate.setUTCDate(startDate.getUTCDate() - (range - 1));

    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    // ✅ Query with both $gte and $lte
    const ordersInRange = await MokesOrder.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalOrders = ordersInRange.length;
    const totalRevenue = ordersInRange.reduce((sum, o) => sum + (o.amount || 0), 0);

    // --- Daily Orders
    const dailyOrders = await MokesOrder.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]).then((res) =>
      res.map((d) => ({
        date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(
          d._id.day
        ).padStart(2, "0")}`,
        count: d.count,
      }))
    );

    // --- Daily Revenue
    const dailyRevenue = await MokesOrder.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]).then((res) =>
      res.map((d) => ({
        date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(
          d._id.day
        ).padStart(2, "0")}`,
        total: d.total,
      }))
    );

    return NextResponse.json({
      success: true,
      totalOrders,
      totalRevenue,
      dailyOrders,
      dailyRevenue,
    });
  } catch (error) {
    console.error("Orders vs Revenue API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
