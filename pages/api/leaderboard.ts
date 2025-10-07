import type { NextApiRequest, NextApiResponse } from "next";

type Purchase = {
  wallet: string;
  amount: number;
};

const purchases: Purchase[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { wallet } = req.query;

  if (!wallet || typeof wallet !== "string") {
    return res.status(400).json({ error: "Missing wallet" });
  }

  const totals: Record<string, number> = {};

  for (const p of purchases) {
    totals[p.wallet] = (totals[p.wallet] || 0) + p.amount;
  }

  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1]);

  const rank = sorted.findIndex(([w]) => w === wallet) + 1;

  const top = sorted.slice(0, 10).map(([wallet, amount]) => ({
    wallet,
    amount: parseFloat(amount.toFixed(4))
  }));

  res.status(200).json({ rank, top });
}
