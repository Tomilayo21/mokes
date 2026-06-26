import mongoose from "mongoose";

const NotificationPreferencesSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // ✅ string, not ObjectId
    orders: {
      newOrder: { type: Boolean, default: true },
      shipped: { type: Boolean, default: true },
      delivered: { type: Boolean, default: true },
    },
    reviews: {
      newReview: { type: Boolean, default: true },
      reviewApproval: { type: Boolean, default: true },
    },
    stockAlerts: {
      lowStock: { type: Boolean, default: false },
      outOfStock: { type: Boolean, default: false },
    },
    marketing: {
      newsletter: { type: Boolean, default: false },
      promotions: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationPreferences ||
  mongoose.model("NotificationPreferences", NotificationPreferencesSchema);
