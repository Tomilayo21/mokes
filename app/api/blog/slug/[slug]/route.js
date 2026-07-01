import connectDB from '@/config/db';
import MokesBlog from '@/models/MokesBlog';


export async function GET(req, { params }){
await connectDB();
const { slug } = params;
const post = await MokesBlog.findOne({ slug, status: 'published' }).populate('author categories tags');
if (!post) return new Response(null, { status: 404 });
return new Response(JSON.stringify(post), { status: 200 });
}