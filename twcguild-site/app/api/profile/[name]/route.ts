import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export type GuildStatus = "prospect" | "accepted" | "removed";

export type Profile = {
  avatarUrl?: string;
  discordTag?: string;
  customTitle?: string;
  steamUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  twitchUrl?: string;
  games?: string[];
  claimedBy?: string;
  guildStatus?: GuildStatus;
  claimedAt?: number;
};

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const key = `profile:${params.name.toLowerCase()}`;
  const data = await redis.get<Profile>(key);

  if (!data) return NextResponse.json({ profile: {} });

  // Lazy migration: existing claimed profiles without a status become Prospects
  if (data.claimedBy && !data.guildStatus) {
    const migrated: Profile = { ...data, guildStatus: "prospect" };
    await redis.set(key, migrated);
    await redis.set(`wallet:${data.claimedBy}`, {
      name: params.name,
      avatarUrl: data.avatarUrl,
      guildStatus: "prospect",
    });
    return NextResponse.json({ profile: migrated });
  }

  return NextResponse.json({ profile: data });
}

export async function POST(req: NextRequest, { params }: { params: { name: string } }) {
  const body = await req.json();
  const wallet: string | undefined = body.wallet?.toLowerCase();
  const key = `profile:${params.name.toLowerCase()}`;

  const existing = await redis.get<Profile>(key) || {};

  if (existing.claimedBy && wallet && existing.claimedBy !== wallet) {
    return NextResponse.json({ error: "Profile claimed by another wallet" }, { status: 403 });
  }

  const isFirstClaim = !existing.claimedBy && !!wallet;

  const updated: Profile = {
    avatarUrl: body.avatarUrl || existing.avatarUrl,
    discordTag: body.discordTag !== undefined ? body.discordTag : existing.discordTag,
    customTitle: body.customTitle !== undefined ? body.customTitle : existing.customTitle,
    steamUrl: body.steamUrl !== undefined ? body.steamUrl : existing.steamUrl,
    youtubeUrl: body.youtubeUrl !== undefined ? body.youtubeUrl : existing.youtubeUrl,
    twitterUrl: body.twitterUrl !== undefined ? body.twitterUrl : existing.twitterUrl,
    twitchUrl: body.twitchUrl !== undefined ? body.twitchUrl : existing.twitchUrl,
    games: body.games !== undefined ? body.games : existing.games,
    claimedBy: existing.claimedBy || wallet,
    // Existing members keep their status; brand-new claims become Prospects automatically
    guildStatus: existing.guildStatus ?? (isFirstClaim ? "prospect" : undefined),
    claimedAt: existing.claimedAt ?? (isFirstClaim ? Date.now() : undefined),
  };

  await redis.set(key, updated);

  const claimedWallet = updated.claimedBy;
  if (claimedWallet) {
    await redis.set(`wallet:${claimedWallet}`, {
      name: params.name,
      avatarUrl: updated.avatarUrl,
      guildStatus: updated.guildStatus,
    });
  }

  return NextResponse.json({ success: true, profile: updated });
}
