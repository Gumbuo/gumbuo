// XP leaderboard for Foxstead — uses ioredis with REDIS_URL (same setup as
// farm-world.js and presence.js). Rebuilt because the old endpoint lived on
// gamehole.ink, which now serves an unrelated Vercel project — every sync/
// fetch was silently hitting that project's HTML instead of this data.
//
// POST { wallet, name, level, xp } -> { ok: true }
// GET                              -> { leaderboard: [{wallet,name,level,xp,rank}, ...] }

const Redis = require("ioredis");

const XP_KEY = "foxstead_xp";
const MAX_ENTRIES = 100;

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
  if (!client) return res.status(200).json({ leaderboard: [], error: "REDIS_URL not set" });

  if (req.method === "GET") {
    try {
      const raw = await client.hgetall(XP_KEY);
      const entries = [];
      for (const json of Object.values(raw || {})) {
        try {
          const e = JSON.parse(json);
          entries.push(e);
        } catch { /* skip malformed entry */ }
      }
      entries.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      const leaderboard = entries.slice(0, MAX_ENTRIES).map((e, i) => ({
        wallet: e.wallet, name: e.name, level: e.level, xp: e.xp, rank: i + 1,
      }));
      return res.status(200).json({ leaderboard });
    } catch (err) {
      return res.status(200).json({ leaderboard: [], error: err.message });
    }
  }

  if (req.method === "POST") {
    let body;
    try { body = await readBody(req); } catch { body = {}; }
    const { wallet, name, level, xp } = body || {};
    if (!wallet) return res.status(400).json({ error: "missing wallet" });
    try {
      const entry = JSON.stringify({
        wallet: String(wallet).toLowerCase(),
        name: name || "Player",
        level: Number(level) || 1,
        xp: Number(xp) || 0,
      });
      await client.hset(XP_KEY, String(wallet).toLowerCase(), entry);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "method not allowed" });
};
