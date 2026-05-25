// utils/logActivity.js
import ActivityLog from "@/models/ActivityLog";
import connectDB from "@/config/db";

export async function logActivity({ type, action, entityId, userId, changes }) {
  try {
    await connectDB();
    await ActivityLog.create({ type, action, entityId, userId, changes });
  } catch (err) {
    console.error("[LOG_ACTIVITY_ERROR]", err);
  }
}
