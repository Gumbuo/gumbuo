let visitors: string[] = [];

export default async function handler(req, res) {
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
