



export async function GET() {
  const brands = await Brand.find().sort({ createdAt: -1 });
  return Response.json(brands);
}