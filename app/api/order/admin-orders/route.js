import connectDB from "@/config/db";
import MokesOrder from "@/models/MokesOrder";
import Address from "@/models/Address"; 
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range") || "7");
    const now = new Date();
    const fromDate = new Date(now);
    fromDate.setDate(now.getDate() - range);

    // --- Fetch recent orders
    const limit = parseInt(searchParams.get("limit")) || 5;
    const page = parseInt(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    const recentOrders = await MokesOrder.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("address")
    .populate("items.product");


    const ordersInRange = await MokesOrder.find({ createdAt: { $gte: fromDate } });
    const totalOrders = ordersInRange.length;
    const totalRevenue = ordersInRange.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    const dailyOrders = await MokesOrder.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
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
        date: `${d._id.year}-${String(d._id.month).padStart(
          2,
          "0"
        )}-${String(d._id.day).padStart(2, "0")}`,
        count: d.count,
      }))
    );

    const dailyRevenue = await MokesOrder.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
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
        date: `${d._id.year}-${String(d._id.month).padStart(
          2,
          "0"
        )}-${String(d._id.day).padStart(2, "0")}`,
        total: d.total,
      }))
    );

    return NextResponse.json({
      success: true,
      totalOrders,
      totalRevenue,
      dailyOrders,
      dailyRevenue,
      orders: recentOrders,
    });
  } catch (error) {
    console.error("Orders API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
