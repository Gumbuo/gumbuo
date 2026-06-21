import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type Profile = {
  avatarUrl?: string;
  discordTag?: string;
  customTitle?: string;
  claimedBy?: string;
};

export async function GET() {
  const keys = await redis.keys("profile:*");
  const profiles: Record<string, Profile> = {};

  await Promise.all(
    keys.map(async (key) => {
      const name = key.replace("profile:", "");
      const data = await redis.get<Profile>(key);
      if (data) profiles[name] = data;
    })
  );

  return NextResponse.json({ profiles });
}
