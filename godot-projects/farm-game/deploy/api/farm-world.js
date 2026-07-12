// World tile storage for Foxstead — backed by Vercel KV REST API (no npm packages needed)
// GET  → returns { tiles: [...] }
// POST → upserts a tile by id, returns { ok: true }

const KV_KEY = "foxstead_world_tiles";

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

async function kvGet(baseUrl, token) {
  const res = await fetch(`${baseUrl}/get/${KV_KEY}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.result) return [];
  try { return JSON.parse(data.result); }
  catch { return []; }
}

async function kvSet(baseUrl, token, tiles) {
  await fetch(`${baseUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([["SET", KV_KEY, JSON.stringify(tiles)]]),
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const baseUrl = process.env.KV_REST_API_URL;
  const token   = process.env.KV_REST_API_TOKEN;

  if (!baseUrl || !token) {
    console.warn("[farm-world] KV env vars missing");
    return res.status(200).json({ tiles: [], warning: "storage not configured" });
  }

  if (req.method === "GET") {
    try {
      const tiles = await kvGet(baseUrl, token);
      return res.status(200).json({ tiles });
    } catch (err) {
      console.error("[farm-world] GET error:", err);
      return res.status(200).json({ tiles: [] });
    }
  }

  if (req.method === "POST") {
    const tile = await readBody(req);
    if (!tile || !tile.id) {
      return res.status(400).json({ error: "missing tile id" });
    }
    try {
      const tiles = await kvGet(baseUrl, token);
      const idx = tiles.findIndex((t) => t.id === tile.id);
      if (idx >= 0) { tiles[idx] = tile; }
      else          { tiles.push(tile); }
      await kvSet(baseUrl, token, tiles);
      return res.status(200).json({ ok: true, count: tiles.length });
    } catch (err) {
      console.error("[farm-world] POST error:", err);
      return res.status(500).json({ error: "storage error" });
    }
  }

  return res.status(405).json({ error: "method not allowed" });
};
