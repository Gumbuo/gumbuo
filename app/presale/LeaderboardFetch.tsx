import { useEffect } from "react";
useEffect(() => {
  if (address) {
    fetch(`/api/leaderboard?wallet=${address}`)
      .then(res => res.json())
      .then(data => {
        setRank(data.rank);
      });
  }
}, [address]);
