import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    zipcode: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String }, 
    email: { type: String }, 
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.models.address || mongoose.model("address", addressSchema);

export default Address;
