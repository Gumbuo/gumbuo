"use client";

export default function Mascots({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2rem", marginTop: "20vh" }}>
      <div style={{ backgroundColor: "black", padding: "1rem", borderRadius: "16px" }}>
        <img src="/zorb.png" alt="Zorb" style={{ width: "480px", height: "auto", borderRadius: "12px" }} />
      </div>
      <div style={{ flexGrow: 1, textAlign: "center", padding: "0 2rem" }}>
        {children}
      </div>
      <div style={{ backgroundColor: "black", padding: "1rem", borderRadius: "16px" }}>
        <img src="/nyx.png" alt="Nyx" style={{ width: "480px", height: "auto", borderRadius: "12px" }} />
      </div>
    </div>
  );
}
