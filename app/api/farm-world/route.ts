import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "../lib/points";

const TILES_KEY = "farm:world:tiles";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

export async function GET() {
  try {
    const redis = getRedis();
    const raw = await redis.hgetall(TILES_KEY);
    const tiles = raw
      ? Object.values(raw).map((v) =>
          typeof v === "string" ? JSON.parse(v) : v
        )
      : [];
    return NextResponse.json({ tiles }, { headers: cors() });
  } catch (e) {
    console.error("farm-world GET error", e);
    return NextResponse.json({ tiles: [] }, { headers: cors() });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, type, type_str, position, owner_id, name, access_mode } = body;
    if (!id || !owner_id || !position) {
      return NextResponse.json(
        { error: "missing fields" },
        { status: 400, headers: cors() }
      );
    }
    const redis = getRedis();
    const tile = { id, type, type_str, position, owner_id, name, access_mode };
    await redis.hset(TILES_KEY, { [id as string]: JSON.stringify(tile) });
    return NextResponse.json({ ok: true }, { headers: cors() });
  } catch (e) {
    console.error("farm-world POST error", e);
    return NextResponse.json(
      { error: "server error" },
      { status: 500, headers: cors() }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { error: "missing id" },
        { status: 400, headers: cors() }
      );
    }
    const redis = getRedis();
    await redis.hdel(TILES_KEY, id as string);
    return NextResponse.json({ ok: true }, { headers: cors() });
  } catch (e) {
    console.error("farm-world DELETE error", e);
    return NextResponse.json(
      { error: "server error" },
      { status: 500, headers: cors() }
    );
  }
}
