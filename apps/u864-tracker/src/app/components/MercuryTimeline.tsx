"use client";

import { useEffect, useRef } from "react";

// Simulated historical mercury data (ppm, annually 1945-2024)
const DATA: { year: number; ppm: number }[] = Array.from(
  { length: 80 },
  (_, i) => {
    const year = 1945 + i;
    const base = 0.05;
    const discovery = year >= 2003 ? 0.1 : 0;
    const noise = Math.sin(i * 0.7) * 0.05 + Math.random() * 0.02;
    const trend = i * 0.003;
    return { year, ppm: Math.max(0, base + trend + discovery + noise) };
  }
);

export default function MercuryTimeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 20, right: 20, bottom: 40, left: 50 };

    const maxPpm = Math.max(...DATA.map((d) => d.ppm)) * 1.1;
    const minYear = DATA[0].year;
    const maxYear = DATA[DATA.length - 1].year;

    function xOf(year: number) {
      return PAD.left + ((year - minYear) / (maxYear - minYear)) * (W - PAD.left - PAD.right);
    }
    function yOf(ppm: number) {
      return H - PAD.bottom - (ppm / maxPpm) * (H - PAD.top - PAD.bottom);
    }

    ctx.fillStyle = "#0a1520";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#1a3048";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = PAD.top + (i / 5) * (H - PAD.top - PAD.bottom);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();
      ctx.fillStyle = "#3a5a78";
      ctx.font = "9px Courier New";
      ctx.fillText(
        ((maxPpm * (5 - i)) / 5).toFixed(2),
        4,
        y + 3
      );
    }

    // Discovery annotation
    ctx.strokeStyle = "#f0a50044";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(xOf(2003), PAD.top);
    ctx.lineTo(xOf(2003), H - PAD.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f0a500";
    ctx.font = "9px Courier New";
    ctx.fillText("2003 oppdaga", xOf(2003) + 4, PAD.top + 12);

    // Area fill
    ctx.beginPath();
    ctx.moveTo(xOf(minYear), yOf(0));
    DATA.forEach((d) => ctx.lineTo(xOf(d.year), yOf(d.ppm)));
    ctx.lineTo(xOf(maxYear), yOf(0));
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
    grad.addColorStop(0, "#cc220044");
    grad.addColorStop(1, "#cc220000");
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = "#cc2200";
    ctx.lineWidth = 1.5;
    DATA.forEach((d, i) => {
      if (i === 0) ctx.moveTo(xOf(d.year), yOf(d.ppm));
      else ctx.lineTo(xOf(d.year), yOf(d.ppm));
    });
    ctx.stroke();

    // X axis labels
    ctx.fillStyle = "#3a5a78";
    ctx.font = "9px Courier New";
    [1945, 1960, 1980, 2003, 2024].forEach((y) => {
      ctx.fillText(String(y), xOf(y) - 10, H - 8);
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={860}
      height={200}
      style={{
        width: "100%",
        height: "auto",
        border: "1px solid #1a3048",
        background: "#0a1520",
      }}
    />
  );
}
