import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export type WalletProfile = {
  name: string;
  avatarUrl?: string;
  guildStatus?: "prospect" | "accepted" | "removed";
};

export async function GET(_req: NextRequest, { params }: { params: { address: string } }) {
  const data = await redis.get<WalletProfile>(`wallet:${params.address.toLowerCase()}`);
  return NextResponse.json({ profile: data || null });
}
