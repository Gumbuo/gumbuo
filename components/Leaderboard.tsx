import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [entries, setEntries] = useState<{ wallet: string; amount: number }[]>([]);

  useEffect(() => {
    fetch("/api/getLeaderboard")
      .then(res => res.json())
      .then(setEntries);
  }, []);

  return (
    <div className="leaderboard">
      <h3>Top Buyers</h3>
      <ol>
        {entries.map(({ wallet, amount }, i) => (
          <li key={i}>
            <strong>{wallet.slice(0, 6)}...</strong> — {amount} GMB
          </li>
        ))}
      </ol>
    </div>
  );
}

