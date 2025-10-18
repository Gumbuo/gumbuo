import { NextResponse } from "next/server";

let purchases: any[] = [];

export async function POST(req: Request) {
  const body = await req.json();
  purchases.push({ ...body, time: Date.now() });
  return NextResponse.json({ status: "ok" });
}

export async function GET() {
  return NextResponse.json(purchases);
}
