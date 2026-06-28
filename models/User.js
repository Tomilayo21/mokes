import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },            
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    imageUrl: { type: String, default: "" },
    cartItems: { type: Object, default: {} },
    welcomeSent: { type: Boolean, default: false },
    imagePublicId: { type: String, default: null },
    passwordHash: { type: String },
    role: { type: String, enum: ["user", "admin", "seller"], default: "user" },
    emailVerified: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    authProvider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    sessions: [
      {
        token: String,
        os: String,
        browser: String,
        ip: String,
        city: String,
        country: String,
        lastActive: Date,
      },
    ],
    sessionVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
