"use client";
import { useState, useEffect } from "react";

type Props = { address: string; ensImage?: string | null; size: number };

export function GuildAvatar({ address, ensImage, size }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(ensImage ?? null);

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
      background: "#0e1814", border: "1px solid #c6f53e40",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", flexShrink: 0,
    }}>
      <svg viewBox="0 0 40 40" width={size * 0.7} height={size * 0.7} xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="15" r="7" fill="#c6f53e99" />
        <path d="M4 38 Q4 26 20 26 Q36 26 36 38" fill="#c6f53e99" />
      </svg>
    </div>
  );
}
