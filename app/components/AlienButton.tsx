"use client";
import { ReactNode } from "react";

interface AlienButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  icon?: string;
}

export default function AlienButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  icon,
}: AlienButtonProps) {
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-cyan-600 to-blue-600
      hover:from-cyan-500 hover:to-blue-500
      border-cyan-400 shadow-cyan-500/50
    `,
    secondary: `
      bg-gradient-to-r from-purple-600 to-pink-600
      hover:from-purple-500 hover:to-pink-500
      border-purple-400 shadow-purple-500/50
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-orange-600
      hover:from-red-500 hover:to-orange-500
      border-red-400 shadow-red-500/50
    `,
    success: `
      bg-gradient-to-r from-green-600 to-emerald-600
      hover:from-green-500 hover:to-emerald-500
      border-green-400 shadow-green-500/50
    `,
  };

  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        relative
        font-bold
        rounded-lg
        border-2
        text-white
        font-electro
        uppercase
        letter-spacing-wide
        transition-all
        duration-300
        transform
        hover:scale-105
        active:scale-100
        shadow-lg
        hover:shadow-xl
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:scale-100
        overflow-hidden
        group
        ${className}
      `}
    >
      {/* Ripple effect */}
      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        {children}
      </span>

      {/* Glow effect */}
      <span className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 bg-current"></span>
    </button>
  );
}
