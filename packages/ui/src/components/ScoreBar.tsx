import React from "react";

interface ScoreBarProps {
  label: string;
  value: number; // 0–100
  color?: string;
}

export function ScoreBar({ label, value, color = "#ff0000" }: ScoreBarProps) {
  return (
    <div style={{ marginBottom: 8, fontFamily: "Courier New, monospace" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginBottom: 4,
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: 2 }}>
          {label}
        </span>
        <span style={{ fontWeight: "bold" }}>{value}</span>
      </div>
      <div
        style={{
          height: 4,
          background: "#1a1a1a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: color,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
