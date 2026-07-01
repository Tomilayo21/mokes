import connectDB from '@/config/db';
import MokesBlog from '@/models/MokesBlog';
import User from '@/models/User';
import slugify from 'slugify';
import cloudinary from "cloudinary";

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ⭐ Combined API handler
export async function GET(req) {
  await connectDB();
  const url = new URL(req.url);

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category');
  const tag = url.searchParams.get('tag');

  const filter = { status: 'published' };

  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { excerpt: new RegExp(search, 'i') },
      { content: new RegExp(search, 'i') },
    ];
  }

  if (category) filter.categories = { $in: [category] };
  if (tag) filter.tags = { $in: [tag] };

  const total = await MokesBlog.countDocuments(filter);

  const posts = await MokesBlog.find(filter)
    .sort({ featured: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author')
    .lean();

  return new Response(JSON.stringify({ posts, total }), { status: 200 });
}

export async function POST(req) {
  await connectDB();

  // If multipart → handle image upload
  const contentType = req.headers.get('content-type');
  const isUpload = contentType && contentType.includes('multipart/form-data');

  if (isUpload) {
    try {
      const form = await req.formData();
      const file = form.get('file');

      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { folder: 'blog' },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      return new Response(JSON.stringify({ url: uploadResult.secure_url }), { status: 200 });

    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
    }
  }

  // 📝 Otherwise → Treat as blog post creation
  const body = await req.json();

  const {
    title,
    content,
    excerpt,
    author,
    categories = [],
    tags = [],
    status,
    metaTitle,
    metaDescription,
    featuredImage,
  } = body;

  if (!author) {
    return new Response(JSON.stringify({ error: "Author is required" }), { status: 400 });
  }

  // Ensure author exists in User model
  const existingUser = await User.findById(author);
  if (!existingUser) {
    return new Response(JSON.stringify({ error: "Invalid author ID" }), { status: 400 });
  }

  const slug = slugify(title, { lower: true, strict: true });
  const readingTime = Math.ceil(content.split(/\s+/).length / 200);

  const post = await MokesBlog.create({
    title,
    content,
    excerpt,
    author,   // simple string ref
    categories,
    tags,
    status,
    slug,
    metaTitle,
    metaDescription,
    readingTime,
    featuredImage,
  });

  return new Response(JSON.stringify({ post }), { status: 201 });
}
