import React, { ButtonHTMLAttributes } from "react";

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

const VARIANTS = {
  primary: {
    background: "#ffffff",
    color: "#000000",
    border: "2px solid #ffffff",
  },
  ghost: {
    background: "transparent",
    color: "#ffffff",
    border: "2px solid #ffffff",
  },
  danger: {
    background: "#ff0000",
    color: "#ffffff",
    border: "2px solid #ff0000",
  },
} as const;

export function BrutalButton({
  variant = "primary",
  children,
  style,
  ...props
}: BrutalButtonProps) {
  const base = VARIANTS[variant];
  return (
    <button
      {...props}
      style={{
        ...base,
        padding: "12px 24px",
        fontFamily: "Courier New, monospace",
        fontSize: 14,
        fontWeight: "bold",
        letterSpacing: 3,
        textTransform: "uppercase",
        cursor: "pointer",
        borderRadius: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
