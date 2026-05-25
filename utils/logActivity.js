// utils/logActivity.js
import connectDB from "@/config/db";
import ActivityLog from "@/models/ActivityLog";

export async function logActivity({ type, action, entityId, userId, changes }) {
  try {
    await connectDB();
    await ActivityLog.create({
      type: type || "system",
      action,
      entityId: entityId ?? null,
      userId: userId ?? null,
      changes: changes ?? null,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("[LOG_ACTIVITY_ERROR]", err);
  }
}
