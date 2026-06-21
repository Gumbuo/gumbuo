import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type LendingRequest = {
  id: string;
  playerName: string;
  item: string;
  note: string;
  createdAt: string;
};

export async function GET() {
  const data = await redis.get<LendingRequest[]>("lending:requests");
  return NextResponse.json({ requests: data || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const existing = (await redis.get<LendingRequest[]>("lending:requests")) || [];
  const newRequest: LendingRequest = {
    id: Date.now().toString(),
    playerName: body.playerName,
    item: body.item,
    note: body.note || "",
    createdAt: new Date().toISOString(),
  };
  await redis.set("lending:requests", [...existing, newRequest]);
  return NextResponse.json({ success: true, request: newRequest });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const existing = (await redis.get<LendingRequest[]>("lending:requests")) || [];
  await redis.set("lending:requests", existing.filter((r) => r.id !== id));
  return NextResponse.json({ success: true });
}
