import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req) {
  try {
    // Get formdata
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload stream → Cloudinary
    const result = await new Promise((resolve, reject) => {
      const upload = cloudinary.v2.uploader.upload_stream(
        { folder: "blog" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      upload.end(buffer);
    });

    return new Response(JSON.stringify({ url: result.secure_url }), {
      status: 200
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
}
