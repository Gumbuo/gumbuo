"use client";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <video className="bg" autoPlay muted loop>
        <source src="/media/alien.mp4" type="video/mp4" />
      </video>
      <div style={{ fontFamily: "sans-serif", padding: "2rem", position: "relative", zIndex: 1 }}>
        <header style={{ marginBottom: "2rem" }}>
          <h1>Gumbuo Dashboard</h1>
          <nav>{/* Add nav links here if needed */}</nav>
        </header>
        {children}
        <footer style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#ccc" }}>
          © 2025 Gumbuo.io — Foxhole productions{" "}
          <img src="/foxhole-logo.png" alt="Foxhole logo" height="20" />
        </footer>
      </div>
    </>
  );
}

