export async function POST(req) {
  const data = await req.json();
  console.log("Wallet connected:", data);
  return new Response("Logged", { status: 200 });
}
