import mongoose from "mongoose";

const clothingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "user",
    },

    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    offerPrice: {
      type: Number,
      required: true,
    },

    image: {
      type: Array,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    subcategory: {
      type: String,
      default: "",
    },

    brand: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      default: "",
    },

    sizes: [
    {
        size: {
        type: String,
        required: true,
        },
        stock: {
        type: Number,
        required: true,
        default: 0,
        },
    },
    ],

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    visible: {
      type: Boolean,
      default: true,
    },

    likes: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Clothing =
  mongoose.models.clothing ||
  mongoose.model("clothing", clothingSchema);

export default Clothing;