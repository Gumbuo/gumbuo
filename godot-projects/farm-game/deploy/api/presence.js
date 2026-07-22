// Live player presence per tile for Foxstead — uses ioredis with REDIS_URL.
// Short-poll model: clients POST their own position every ~1.2s and GET
// everyone else currently on the same tile. Stale entries (no update in
// STALE_MS) are filtered out at read time, so a closed tab / dropped
// connection just fades out on its own without any cleanup job.
//
// Also doubles as the global "players online" heartbeat (replaces the old
// dead gamehole.ink/api/presence, which points at an unrelated project and
// was silently returning that project's HTML — the HUD's online count has
// never actually worked). Every POST (whether or not it includes a
// tile_id) refreshes the caller's entry in a global last-seen hash.
//
// POST { tile_id, wallet, name, x, y, facing }              -> { ok: true }
// POST { wallet }  (no tile_id — HUD heartbeat only)         -> { ok: true }
// POST { action: "leave", tile_id, wallet }                  -> { ok: true }
// GET  ?tile_id=xxx&wallet=yyy (yyy = requester, excluded)   -> { players: [...] }
// GET  ?online=1                                             -> { online: N }

const Redis = require("ioredis");

const STALE_MS = 8000;
const HASH_TTL_SEC = 30;
const GLOBAL_KEY = "foxstead_presence_global";
const GLOBAL_STALE_MS = 300000; // 5 min — HUD heartbeat fires every 2 min

let _client = null;
function getClient() {
  if (!process.env.REDIS_URL) return null;
  if (!_client || _client.status === "end") {
    _client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      enableReadyCheck: false,
    });
  }
  return _client;
}

function presenceKey(tileId) {
  return `foxstead_presence:${tileId}`;
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === "object" ? req.body : JSON.parse(String(req.body));
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => { data += c; });
    req.on("end", () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const client = getClient();
  if (!client) return res.status(200).json({ players: [], error: "REDIS_URL not set" });

  if (req.method === "GET") {
    const url = new URL(req.url, "http://x");

    if (url.searchParams.get("online") === "1") {
      try {
        const raw = await client.hgetall(GLOBAL_KEY);
        const now = Date.now();
        let count = 0;
        for (const ts of Object.values(raw || {})) {
          if (now - Number(ts) <= GLOBAL_STALE_MS) count++;
        }
        return res.status(200).json({ online: count });
      } catch (err) {
        return res.status(200).json({ online: 0, error: err.message });
      }
    }

    const tileId = url.searchParams.get("tile_id") || "";
    const wallet = (url.searchParams.get("wallet") || "").toLowerCase();
    if (!tileId) return res.status(400).json({ error: "missing tile_id" });
    try {
      const raw = await client.hgetall(presenceKey(tileId));
      const now = Date.now();
      const players = [];
      for (const [w, json] of Object.entries(raw || {})) {
        if (w === wallet) continue;
        let entry;
        try { entry = JSON.parse(json); } catch { continue; }
        if (now - (entry.ts || 0) > STALE_MS) continue;
        players.push(entry);
      }
      return res.status(200).json({ players });
    } catch (err) {
      return res.status(200).json({ players: [], error: err.message });
    }
  }

  if (req.method === "POST") {
    let body;
    try { body = await readBody(req); } catch { body = {}; }

    if (body && body.action === "leave") {
      const tileId = body.tile_id;
      const wallet = (body.wallet || "").toLowerCase();
      if (!tileId || !wallet) return res.status(400).json({ error: "missing tile_id/wallet" });
      try {
        await client.hdel(presenceKey(tileId), wallet);
        return res.status(200).json({ ok: true });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    const { tile_id, wallet, name, x, y, facing } = body || {};
    if (!wallet) return res.status(400).json({ error: "missing wallet" });
    try {
      await client.hset(GLOBAL_KEY, String(wallet).toLowerCase(), String(Date.now()));
    } catch (err) {
      // Non-fatal — the global online count is a nice-to-have, don't fail
      // the whole request (especially the tile-position update below) over it.
    }

    // Heartbeat-only call from the HUD (no tile_id) — global refresh above
    // is all it needed.
    if (!tile_id) return res.status(200).json({ ok: true });

    try {
      const key = presenceKey(tile_id);
      const entry = JSON.stringify({
        wallet: String(wallet).toLowerCase(),
        name: name || "Player",
        x: Number(x) || 0,
        y: Number(y) || 0,
        facing: facing || "south",
        ts: Date.now(),
      });
      await client.hset(key, String(wallet).toLowerCase(), entry);
      await client.expire(key, HASH_TTL_SEC);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "method not allowed" });
};
