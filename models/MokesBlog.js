import mongoose from 'mongoose';
const { Schema } = mongoose;

const MokesBlogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  excerpt: { type: String },
  content: { type: String },

  // ⭐ author is now a STRING, not ObjectId
  author: { type: String, ref: "User", required: true },

  featuredImage: { type: String },

  // ⭐ categories & tags are STRING ARRAYS, not ObjectId
  categories: [{ type: String }],
  tags: [{ type: String }],

  readingTime: { type: Number },

  metaTitle: { type: String },
  metaDescription: { type: String },
  ogImage: { type: String },

  status: { type: String, enum: ["draft", "published"], default: "draft" },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
},
{ timestamps: true }
);

export default mongoose.models.MokesBlog || mongoose.model('MokesBlog', MokesBlogSchema);
