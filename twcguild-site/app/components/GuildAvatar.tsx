"use client";
import { useState, useEffect } from "react";

type Props = { address: string; ensImage: string | null; size: number };

export function GuildAvatar({ address, ensImage, size }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(ensImage);

  useEffect(() => {
    fetch(`/api/wallet/${address.toLowerCase()}`)
      .then(r => r.json())
      .then(d => { if (d.profile?.avatarUrl) setAvatarUrl(d.profile.avatarUrl); })
      .catch(() => {});
  }, [address]);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        width={size}
        height={size}
        alt="Profile"
        style={{ borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#45a29e33", border: "1px solid #45a29e",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#45a29e", fontSize: size * 0.38, fontWeight: "bold",
    }}>
      {address.slice(2, 4).toUpperCase()}
    </div>
  );
}
