"use client";

import { useEffect, useState } from "react";

export default function PresaleBar() {
  const [sold, setSold] = useState(0);
  const total = 350_000_000;
  const percent = Math.min((sold / total) * 100, 100);

  useEffect(() => {
    fetch("/api/getPurchases")
      .then((res) => res.json())
      .then((data) => {
        if (data?.totalSold) {
          setSold(data.totalSold);
        }
      })
      .catch(() => setSold(0));
  }, []);

  return (
    <div style={{ margin: "2rem auto", fontSize: "2rem", color: "white", backgroundColor: "rgba(0,0,0,0.5)", padding: "1rem", borderRadius: "8px", width: "60%" }}>
      <div style={{ backgroundColor: "#333", height: "24px", borderRadius: "12px", overflow: "hidden", marginBottom: "1rem" }}>
        <div style={{ width: `${percent}%`, backgroundColor: "lime", height: "100%" }} />
      </div>
      <p>Presale Progress: {sold.toLocaleString()} / {total.toLocaleString()} GMB sold</p>
    </div>
  );
}

