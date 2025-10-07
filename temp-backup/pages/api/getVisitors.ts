import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "data", "visitors.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!fs.existsSync(filePath)) return res.status(200).json([]);
  const visitors = JSON.parse(fs.readFileSync(filePath, "utf8"));
  res.status(200).json(visitors);
}
