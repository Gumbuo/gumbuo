import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { walletAddress, amount, tokenIn, tokenOut, txHash } = req.body;

  if (!walletAddress || !amount || !tokenIn || !tokenOut || !txHash) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // TODO: Save to database or log file
  console.log("Purchase logged:", {
    walletAddress,
    amount,
    tokenIn,
    tokenOut,
    txHash,
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({ success: true });
}
