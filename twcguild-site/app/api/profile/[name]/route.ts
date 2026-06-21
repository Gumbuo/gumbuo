import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const data = await redis.get(`profile:${params.name.toLowerCase()}`);
  return NextResponse.json({ profile: data || {} });
}

export async function POST(req: NextRequest, { params }: { params: { name: string } }) {
  const body = await req.json();
  await redis.set(`profile:${params.name.toLowerCase()}`, body);
  return NextResponse.json({ success: true });
}
