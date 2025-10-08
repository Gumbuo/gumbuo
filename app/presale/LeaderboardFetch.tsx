import { useEffect } from "react";
import { useAccount } from "wagmi";

const { address } = useAccount();

useEffect(() => {
  if (address) {
    fetch(`/api/leaderboard?wallet=${address}`)
      .then(res => res.json())
      .then(data => {
        // handle leaderboard data
      });
  }
}, [address]);

