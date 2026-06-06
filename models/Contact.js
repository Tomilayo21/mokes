// models/Contact.js
import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  archived: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  device: String,
  location: String,
});

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
