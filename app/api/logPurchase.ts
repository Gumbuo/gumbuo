export async function POST(req) {
  const data = await req.json();
  console.log("Purchase logged:", data);
  return new Response("Logged", { status: 200 });
}
