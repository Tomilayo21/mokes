import { v2 as cloudinary } from 'cloudinary';
import Settings from '@/models/Settings';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'light' or 'dark'

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    const settings = await Settings.findOne();
    if (!settings) {
      return NextResponse.json({ error: 'No settings found' }, { status: 404 });
    }

    const logoUrl =
      type === 'light' ? settings.lightLogoUrl : settings.darkLogoUrl;

    if (!logoUrl) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    // Extract public ID
    const urlParts = logoUrl.split('/');
    const publicIdWithExtension = urlParts.pop();
    const folder = 'site-logos';
    const publicId = `${folder}/${publicIdWithExtension.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);

    if (type === 'light') settings.lightLogoUrl = undefined;
    if (type === 'dark') settings.darkLogoUrl = undefined;

    await settings.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete Error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
