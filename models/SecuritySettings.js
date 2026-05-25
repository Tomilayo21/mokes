import mongoose from "mongoose";

const SecuritySettingsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // Clerk userId
    twoFA: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },
    loginAlerts: { type: Boolean, default: false },
    passwordExpiry: { type: Boolean, default: false },
    restrictIP: { type: String, default: "" },
    restrictCountry: { type: String, default: "" },
    confirmAdminAction: { type: Boolean, default: false },
    auditLogging: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.SecuritySettings ||
  mongoose.model("SecuritySettings", SecuritySettingsSchema);
