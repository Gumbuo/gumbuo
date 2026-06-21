import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type Profile = {
  avatarUrl?: string;
  discordTag?: string;
  customTitle?: string;
  claimedBy?: string;
};

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const data = await redis.get<Profile>(`profile:${params.name.toLowerCase()}`);
  return NextResponse.json({ profile: data || {} });
}

export async function POST(req: NextRequest, { params }: { params: { name: string } }) {
  const body = await req.json();
  const wallet: string | undefined = body.wallet?.toLowerCase();
  const key = `profile:${params.name.toLowerCase()}`;

  const existing = await redis.get<Profile>(key) || {};

  if (existing.claimedBy && wallet && existing.claimedBy !== wallet) {
    return NextResponse.json({ error: "Profile claimed by another wallet" }, { status: 403 });
  }

  const updated: Profile = {
    avatarUrl: body.avatarUrl || existing.avatarUrl,
    discordTag: body.discordTag !== undefined ? body.discordTag : existing.discordTag,
    customTitle: body.customTitle !== undefined ? body.customTitle : existing.customTitle,
    claimedBy: existing.claimedBy || wallet,
  };

  await redis.set(key, updated);

  // Keep reverse wallet→profile lookup in sync
  const claimedWallet = updated.claimedBy;
  if (claimedWallet) {
    await redis.set(`wallet:${claimedWallet}`, {
      name: params.name,
      avatarUrl: updated.avatarUrl,
    });
  }

  return NextResponse.json({ success: true, profile: updated });
}
