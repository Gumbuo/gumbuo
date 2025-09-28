import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "data", "purchases.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Purchase log attempt:", req.body);

  if (req.method !== "POST") return res.status(405).end();

  const { walletAddress, amount, tokenIn, tokenOut, timestamp } = req.body;
  if (!walletAddress || !amount || !tokenIn || !tokenOut || !timestamp) {
    return res.status(400).json({ error: "Missing fields" });
  }

  let purchases = [];
  if (fs.existsSync(filePath)) {
    purchases = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  purchases.push({ walletAddress, amount, tokenIn, tokenOut, timestamp });
  fs.writeFileSync(filePath, JSON.stringify(purchases, null, 2));

  res.status(200).json({ success: true });
}
