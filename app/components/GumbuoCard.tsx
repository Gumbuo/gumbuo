"use client";
import { ReactNode } from "react";

interface GumbuoCardProps {
  children: ReactNode;
  variant?: "default" | "neon" | "portal" | "cyber";
  className?: string;
  hoverable?: boolean;
}

export default function GumbuoCard({
  children,
  variant = "default",
  className = "",
  hoverable = true,
}: GumbuoCardProps) {
  const variantClasses = {
    default: "holographic-panel glass-panel",
    neon: "holographic-panel glass-panel electric-border",
    portal: "holographic-panel glass-panel portal-effect",
    cyber: "holographic-panel glass-panel cyber-lines",
  };

  const hoverClass = hoverable ? "hover-scale-102 cursor-pointer" : "";

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${hoverClass}
        p-6 rounded-2xl relative overflow-hidden
        transition-all duration-300
        ${className}
      `}
    >
      {/* Corner glows */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
