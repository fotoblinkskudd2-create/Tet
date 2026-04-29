"use client";

import { useEffect, useRef } from "react";

const WRECK_LAT = 60.752;
const WRECK_LNG = 4.575;

const SAMPLE_POINTS = [
  { lat: 60.752, lng: 4.575, mercury: 0.47, label: "Vrakpunkt" },
  { lat: 60.761, lng: 4.582, mercury: 0.21, label: "Nord" },
  { lat: 60.743, lng: 4.568, mercury: 0.31, label: "Sør" },
  { lat: 60.755, lng: 4.560, mercury: 0.18, label: "Vest" },
  { lat: 60.749, lng: 4.590, mercury: 0.29, label: "Aust" },
];

function mercuryToColor(ppm: number): string {
  if (ppm > 0.4) return "#cc2200";
  if (ppm > 0.25) return "#f0a500";
  return "#39d353";
}

export default function PollutionMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const latRange = [60.73, 60.78];
    const lngRange = [4.54, 4.61];

    function project(lat: number, lng: number): [number, number] {
      const x =
        ((lng - lngRange[0]) / (lngRange[1] - lngRange[0])) * W;
      const y =
        H - ((lat - latRange[0]) / (latRange[1] - latRange[0])) * H;
      return [x, y];
    }

    // Background — dark sea
    ctx.fillStyle = "#0d1b2a";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#1a3048";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      const x = (i / 8) * W;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      const y = (i / 8) * H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Pollution halos
    SAMPLE_POINTS.forEach((pt) => {
      const [x, y] = project(pt.lat, pt.lng);
      const radius = pt.mercury * 120;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const color = mercuryToColor(pt.mercury);
      gradient.addColorStop(0, color + "66");
      gradient.addColorStop(1, color + "00");
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    // Wreck marker
    const [wx, wy] = project(WRECK_LAT, WRECK_LNG);
    ctx.strokeStyle = "#cc2200";
    ctx.lineWidth = 1;
    const s = 8;
    ctx.beginPath();
    ctx.moveTo(wx - s, wy - s);
    ctx.lineTo(wx + s, wy + s);
    ctx.moveTo(wx + s, wy - s);
    ctx.lineTo(wx - s, wy + s);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#c8d6e5";
    ctx.font = "10px Courier New";
    SAMPLE_POINTS.forEach((pt) => {
      const [x, y] = project(pt.lat, pt.lng);
      ctx.fillText(`${pt.label} ${pt.mercury}ppm`, x + 8, y - 4);
    });

    // Legend
    ctx.fillStyle = "#3a5a78";
    ctx.font = "9px Courier New";
    ctx.fillText("■ LÅGT  ■ MIDDELS  ■ HØGT", 12, H - 12);
    ctx.fillStyle = "#39d353";
    ctx.fillText("■", 12, H - 12);
    ctx.fillStyle = "#f0a500";
    ctx.fillText("■", 52, H - 12);
    ctx.fillStyle = "#cc2200";
    ctx.fillText("■", 92, H - 12);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={420}
      style={{
        width: "100%",
        height: "auto",
        border: "1px solid #1a3048",
        background: "#0d1b2a",
      }}
    />
  );
}
