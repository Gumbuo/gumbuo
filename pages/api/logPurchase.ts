import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const logPath = path.resolve(process.cwd(), "public", "purchase-log.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const log = JSON.parse(fs.readFileSync(logPath, "utf8"));
      return res.status(200).json({ list: log });
    } catch {
      return res.status(200).json({ list: [] });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { walletAddress, amount, tokenIn, tokenOut, txHash } = req.body;

  if (!walletAddress || !amount || !tokenIn || !tokenOut || !txHash) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const entry = {
    walletAddress,
    amount,
    tokenIn,
    tokenOut,
    txHash,
    timestamp: new Date().toISOString(),
  };

  try {
    let log = [];
    if (fs.existsSync(logPath)) {
      log = JSON.parse(fs.readFileSync(logPath, "utf8"));
    }
    log.unshift(entry);
    fs.writeFileSync(logPath, JSON.stringify(log.slice(0, 50), null, 2));
  } catch (e) {
    console.error("Failed to write purchase log:", e);
  }

  console.log("Purchase logged:", entry);
  return res.status(200).json({ success: true });
}
