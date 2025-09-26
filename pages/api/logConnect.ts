let visitors: string[] = [];

import type { NextApiRequest, NextApiResponse } from "next";`n`nexport default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { wallet } = req.body;
    if (wallet && !visitors.includes(wallet)) {
      visitors.push(wallet);
    }
    res.status(200).json({ list: visitors.slice(0, 50) });
  } else if (req.method === "GET") {
    res.status(200).json({ list: visitors.slice(0, 50) });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

