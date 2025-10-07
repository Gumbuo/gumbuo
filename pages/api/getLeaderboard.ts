import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const logPath = path.resolve(process.cwd(), "logs/purchases.json");
  if (!fs.existsSync(logPath)) return res.status(200).json([]);

  const logs = JSON.parse(fs.readFileSync(logPath, "utf8"));
  const leaderboard: Record<string, number> = {};

  logs.forEach(({ wallet, amount }: { wallet: string; amount: string }) => {
    leaderboard[wallet] = (leaderboard[wallet] || 0) + parseFloat(amount);
  });

  const sorted = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([wallet, total]) => ({ wallet, total }));

  res.status(200).json(sorted);
}
