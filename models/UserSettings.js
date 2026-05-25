import mongoose from "mongoose";

const UserSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  themeColor: { type: String, default: "#f97316" },
  themeMode: { type: String, enum: ["light", "dark"], default: "light" },
  contrastMode: { type: Boolean, default: false },
  layoutStyle: { type: String, enum: ["grid", "list"], default: "grid" },
  fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
});

export default mongoose.models.UserSettings || mongoose.model("UserSettings", UserSettingsSchema);
