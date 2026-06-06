// 1. Mongoose Message Model (models/Message.js)
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: String,
    senderName: String,
    content: String,
    isAdmin: Boolean,
    chatId: String,
    read: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent"
    }
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
