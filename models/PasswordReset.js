// import mongoose from "mongoose";

// const PasswordResetSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   token: { type: String, required: true, unique: true },
//   expiresAt: { type: Date, required: true },
// }, { timestamps: true });

// export default mongoose.models.PasswordReset || mongoose.model("PasswordReset", PasswordResetSchema);










import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true }, // string ID
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const PasswordReset =
  mongoose.models.PasswordReset || mongoose.model("PasswordReset", PasswordResetSchema);

export default PasswordReset;
