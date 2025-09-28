import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "data", "visitors.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Visitor log attempt:", req.body);

  if (req.method !== "POST") return res.status(405).end();

  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: "Missing wallet" });

  let visitors = [];
  if (fs.existsSync(filePath)) {
    visitors = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  const normalized = wallet.toLowerCase();
  if (!visitors.includes(normalized)) {
    visitors.push(normalized);
    fs.writeFileSync(filePath, JSON.stringify(visitors, null, 2));
  }

  res.status(200).json({ success: true });
}
