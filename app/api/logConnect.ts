import { NextRequest } from "next/server";`nexport async function POST(req: NextRequest) {
  const data = await req.json();
  console.log("Wallet connected:", data);
  return new Response("Logged", { status: 200 });
}
