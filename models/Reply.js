import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  to: { type: String, required: true },
  cc: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  originalMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  sentAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["active", "deleted"],
    default: "active",
  },
});


export default mongoose.models.Reply || mongoose.model("Reply", replySchema);
