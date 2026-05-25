// import mongoose from 'mongoose';

// const activityLogSchema = new mongoose.Schema({
//   action: String,
//   detail: String,
//   timestamp: { type: Date, default: Date.now },
// });

// export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);





















// models/ActivityLog.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["user", "order", "product", "erc", "other"], 
    default: "other" 
  },
  action: { type: String, required: true },
  entityId: { type: String, default: null },
  userId: { type: String, default: null }, // Who performed the action
  changes: { type: mongoose.Schema.Types.Mixed }, // snapshot of the object
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);
