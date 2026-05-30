import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
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

export default mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
