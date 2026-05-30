import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clothing",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
