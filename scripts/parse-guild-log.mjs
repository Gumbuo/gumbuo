import { readFileSync, writeFileSync } from 'fs';

const LOG_PATH = process.argv[2] || 'guild-log-2026-05-22.txt';
const raw = readFileSync(LOG_PATH, 'utf-8');
const lines = raw.split('\n');

// Strip leading line number and trailing timestamp like "about 24 hours ago"
function cleanLine(line) {
  return line.replace(/^\d+\t/, '').replace(/\s+about \d+ hours? ago\s*$/, '').trim();
}

// Per-player data structure
function emptyPlayer() {
  return {
    planted: {},   // seed type -> count
    harvested: {}, // item type -> total quantity
    trees: 0,      // total wood from trees
    treeTiles: {}, // tile -> wood count (for info)
    mined: {},     // mineral -> total quantity
    fished: {},    // fish type -> total quantity
    quests: {},    // item -> total quantity contributed
    unplanted: {}, // seed type -> count (track but separate)
  };
}

const players = {};

function getPlayer(name) {
  if (!players[name]) players[name] = emptyPlayer();
  return players[name];
}

// Patterns
const PLANTED   = /^(.+?) planted (.+?) (?:seeds?|spores?) in the tile of (.+?)\.$/;
const HARVESTED = /^(.+?) harvested (.+?) in the tile of (.+?) and received (\d+) (.+?)\.$/;
const CUT_TREE  = /^(.+?) cut a tree in the tile of (.+?) and received (\d+) wood\.$/;
const MINED     = /^(.+?) mined a rock in the tile of (.+?) and received (\d+) (.+?)\.$/;
const FISHED    = /^(.+?) fished in the tile of (.+?) and received (\d+) (.+?)\.$/;
const QUEST     = /^(.+?) contributed (\d+) (.+?) to the daily quest\.$/;
const UNPLANTED = /^(.+?) unplanted (.+?) in the tile of (.+?)\.$/;

for (const rawLine of lines) {
  const line = cleanLine(rawLine);
  if (!line) continue;

  let m;

  if ((m = PLANTED.exec(line))) {
    const [, player, seed] = m;
    const p = getPlayer(player);
    p.planted[seed] = (p.planted[seed] || 0) + 1;

  } else if ((m = HARVESTED.exec(line))) {
    const [, player, , , qty, item] = m;
    const p = getPlayer(player);
    const n = parseInt(qty, 10);
    p.harvested[item] = (p.harvested[item] || 0) + n;

  } else if ((m = CUT_TREE.exec(line))) {
    const [, player, , qty] = m;
    const p = getPlayer(player);
    p.trees += parseInt(qty, 10);

  } else if ((m = MINED.exec(line))) {
    const [, player, , qty, mineral] = m;
    const p = getPlayer(player);
    const n = parseInt(qty, 10);
    p.mined[mineral] = (p.mined[mineral] || 0) + n;

  } else if ((m = FISHED.exec(line))) {
    const [, player, , qty, fish] = m;
    const p = getPlayer(player);
    const n = parseInt(qty, 10);
    p.fished[fish] = (p.fished[fish] || 0) + n;

  } else if ((m = QUEST.exec(line))) {
    const [, player, qty, item] = m;
    const p = getPlayer(player);
    const n = parseInt(qty, 10);
    p.quests[item] = (p.quests[item] || 0) + n;

  } else if ((m = UNPLANTED.exec(line))) {
    const [, player, seed] = m;
    const p = getPlayer(player);
    p.unplanted[seed] = (p.unplanted[seed] || 0) + 1;
  }
}

// Sort players by total activity score (rough contribution measure)
function activityScore(p) {
  const harvestTotal = Object.values(p.harvested).reduce((a, b) => a + b, 0);
  const plantTotal   = Object.values(p.planted).reduce((a, b) => a + b, 0);
  const mineTotal    = Object.values(p.mined).reduce((a, b) => a + b, 0);
  const fishTotal    = Object.values(p.fished).reduce((a, b) => a + b, 0);
  const questTotal   = Object.values(p.quests).reduce((a, b) => a + b, 0);
  return harvestTotal + plantTotal + p.trees + mineTotal + fishTotal + questTotal;
}

const sorted = Object.entries(players).sort((a, b) => activityScore(b[1]) - activityScore(a[1]));

// ── HTML generation ────────────────────────────────────────────────────────────

function badge(label, val, color) {
  return `<span style="background:${color};color:#fff;padding:2px 7px;border-radius:4px;font-size:13px;margin-right:4px;">${label}: <strong>${val}</strong></span>`;
}

function itemRows(map, unit = '') {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `<tr><td style="padding:2px 10px 2px 0;">${k}</td><td style="padding:2px 0;text-align:right;font-weight:bold;">${v}${unit}</td></tr>`)
    .join('');
}

function section(title, emoji, rows) {
  if (!rows) return '';
  return `
    <div style="margin-bottom:8px;">
      <div style="font-weight:bold;color:#555;font-size:13px;margin-bottom:2px;">${emoji} ${title}</div>
      <table style="font-size:13px;border-collapse:collapse;">${rows}</table>
    </div>`;
}

let totalHarvested = 0, totalPlanted = 0, totalWood = 0, totalMined = 0, totalFish = 0, totalQuest = 0;
for (const [, p] of sorted) {
  totalHarvested += Object.values(p.harvested).reduce((a, b) => a + b, 0);
  totalPlanted   += Object.values(p.planted).reduce((a, b) => a + b, 0);
  totalWood      += p.trees;
  totalMined     += Object.values(p.mined).reduce((a, b) => a + b, 0);
  totalFish      += Object.values(p.fished).reduce((a, b) => a + b, 0);
  totalQuest     += Object.values(p.quests).reduce((a, b) => a + b, 0);
}

const playerCards = sorted.map(([name, p], i) => {
  const score = activityScore(p);
  if (score === 0) return '';

  const harv = Object.entries(p.harvested).sort((a, b) => b[1] - a[1]);
  const planted = Object.entries(p.planted).sort((a, b) => b[1] - a[1]);
  const mined = Object.entries(p.mined).sort((a, b) => b[1] - a[1]);
  const fished = Object.entries(p.fished).sort((a, b) => b[1] - a[1]);
  const quests = Object.entries(p.quests).sort((a, b) => b[1] - a[1]);

  const totalHarv = harv.reduce((a, [, v]) => a + v, 0);
  const totalPlant = planted.reduce((a, [, v]) => a + v, 0);
  const totalMin = mined.reduce((a, [, v]) => a + v, 0);
  const totalFish2 = fished.reduce((a, [, v]) => a + v, 0);
  const totalQ = quests.reduce((a, [, v]) => a + v, 0);

  const medals = ['🥇','🥈','🥉'];
  const medal = i < 3 ? medals[i] + ' ' : '';

  return `
<div style="background:#f9f9f9;border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:16px;">
  <h3 style="margin:0 0 10px;font-size:18px;border-bottom:2px solid #e0e0e0;padding-bottom:6px;">
    ${medal}${name}
  </h3>
  <div style="margin-bottom:10px;line-height:1.8;">
    ${totalHarv  ? badge('Harvested', totalHarv + ' items', '#2e7d32') : ''}
    ${totalPlant ? badge('Planted',   totalPlant + ' seeds', '#1565c0') : ''}
    ${p.trees    ? badge('Wood',      p.trees,               '#6d4c41') : ''}
    ${totalMin   ? badge('Mined',     totalMin + ' minerals','#6a1b9a') : ''}
    ${totalFish2 ? badge('Fished',    totalFish2 + ' fish',  '#00838f') : ''}
    ${totalQ     ? badge('Quest',     totalQ + ' contributed','#e65100') : ''}
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:20px;">
    ${harv.length    ? section('Harvested',         '🌾', itemRows(p.harvested)) : ''}
    ${planted.length ? section('Planted',           '🌱', itemRows(p.planted, ' seeds')) : ''}
    ${p.trees        ? section('Tree Chopping',     '🪓', `<tr><td>Wood collected</td><td style="padding:2px 0 2px 10px;font-weight:bold;">${p.trees}</td></tr>`) : ''}
    ${mined.length   ? section('Mining',            '⛏️',  itemRows(p.mined)) : ''}
    ${fished.length  ? section('Fishing',           '🎣', itemRows(p.fished)) : ''}
    ${quests.length  ? section('Daily Quest',       '📋', itemRows(p.quests)) : ''}
  </div>
</div>`;
}).join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guild Activity Report — 2026-05-22</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1 { font-size: 26px; border-bottom: 3px solid #333; padding-bottom: 10px; }
    h2 { font-size: 20px; color: #444; }
    .summary-box { background:#eef6ff;border:1px solid #b0d0ff;border-radius:8px;padding:14px 20px;margin-bottom:24px; }
    .summary-box span { display:inline-block;margin-right:16px;font-size:14px; }
  </style>
</head>
<body>
  <h1>⚔️ Guild Activity Report — 22 May 2026</h1>

  <div class="summary-box">
    <strong>Guild Totals</strong><br><br>
    <span>👥 <strong>${sorted.filter(([,p]) => activityScore(p) > 0).length}</strong> active members</span>
    <span>🌾 <strong>${totalHarvested.toLocaleString()}</strong> items harvested</span>
    <span>🌱 <strong>${totalPlanted.toLocaleString()}</strong> seeds planted</span>
    <span>🪓 <strong>${totalWood.toLocaleString()}</strong> wood chopped</span>
    <span>⛏️ <strong>${totalMined.toLocaleString()}</strong> minerals mined</span>
    <span>🎣 <strong>${totalFish.toLocaleString()}</strong> fish caught</span>
    <span>📋 <strong>${totalQuest.toLocaleString()}</strong> quest items contributed</span>
  </div>

  <h2>Member Contributions (ranked by activity)</h2>
  ${playerCards}

  <p style="color:#999;font-size:12px;margin-top:30px;">Generated from guild log · ${new Date().toISOString().slice(0,10)}</p>
</body>
</html>`;

const outPath = 'guild-activity-2026-05-22.html';
writeFileSync(outPath, html, 'utf-8');
console.log(`\nHTML written to: ${outPath}`);

// Also write JSON for the Next.js page
const jsonData = {
  date: '2026-05-22',
  totals: { totalHarvested, totalPlanted, totalWood, totalMined, totalFish, totalQuest },
  players: sorted
    .filter(([, p]) => activityScore(p) > 0)
    .map(([name, p]) => ({ name, score: activityScore(p), ...p })),
};
const jsonPath = 'app/guildevents/activity-data.json';
writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
console.log(`JSON written to: ${jsonPath}`);
console.log(`\nPlayers found: ${jsonData.players.length}`);
jsonData.players.forEach(({ name, score }) => console.log(`  ${name}: ${score}`));
