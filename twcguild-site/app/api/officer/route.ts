import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { Profile } from "../profile/[name]/route";

// Server-side only — never exposed to the client
function getOfficerWallets(): string[] {
  const raw = process.env.OFFICER_WALLETS || "";
  return raw.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
}

function isOfficer(wallet: string): boolean {
  return getOfficerWallets().includes(wallet.toLowerCase());
}

// GET /api/officer  — returns all pending (and optionally all) guild profiles
// Requires ?wallet=0x... to verify officer status
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet")?.toLowerCase();
  if (!wallet || !isOfficer(wallet)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const keys = await redis.keys("profile:*");
  const pending: { name: string; profile: Profile }[] = [];
  const members: { name: string; profile: Profile }[] = [];

  await Promise.all(
    keys.map(async (key) => {
      const name = key.replace("profile:", "");
      const data = await redis.get<Profile>(key);
      if (!data?.claimedBy) return;
      if (data.guildStatus === "prospect" || data.guildStatus === ("pending" as string)) {
        pending.push({ name, profile: data });
      } else if (data.guildStatus === "accepted") {
        members.push({ name, profile: data });
      }
    })
  );

  pending.sort((a, b) => (a.profile.claimedAt ?? 0) - (b.profile.claimedAt ?? 0));
  members.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ pending, members });
}

// POST /api/officer  — approve or remove a member
// Body: { officerWallet, name, action: "accept" | "remove" }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const officerWallet: string = (body.officerWallet ?? "").toLowerCase();
  const targetName: string = (body.name ?? "").toLowerCase();
  const action: "accept" | "remove" = body.action;

  if (!isOfficer(officerWallet)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!targetName || !["accept", "remove"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const key = `profile:${targetName}`;
  const profile = await redis.get<Profile>(key);

  if (!profile?.claimedBy) {
    return NextResponse.json({ error: "Profile not found or unclaimed" }, { status: 404 });
  }

  const newStatus = action === "accept" ? "accepted" : "removed";
  const updated: Profile = { ...profile, guildStatus: newStatus };

  await redis.set(key, updated);
  await redis.set(`wallet:${profile.claimedBy}`, {
    name: targetName,
    avatarUrl: profile.avatarUrl,
    guildStatus: newStatus,
  });

  return NextResponse.json({ success: true, name: targetName, guildStatus: newStatus });
}
