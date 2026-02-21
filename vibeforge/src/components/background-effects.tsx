"use client";

import { useEffect, useRef } from "react";
import { useVibe } from "@/context/vibe-context";

export function BackgroundEffects() {
  const { currentVibe } = useVibe();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const effect = currentVibe.backgroundEffect;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; char?: string }[] = [];

    if (effect === "matrix-rain") {
      const cols = Math.floor(canvas.width / 16);
      particles = Array.from({ length: cols }, (_, i) => ({
        x: i * 16,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 2 + Math.random() * 3,
        size: 14,
        alpha: Math.random(),
        char: String.fromCharCode(0x30A0 + Math.random() * 96),
      }));
    } else if (effect === "void-particles" || effect === "glass-orbs") {
      particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.4,
      }));
    } else if (effect === "cyber-grid" || effect === "synth-grid") {
      particles = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.2 + Math.random() * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.3,
      }));
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (effect === "matrix-rain") {
        ctx.font = "14px monospace";
        for (const p of particles) {
          ctx.fillStyle = `rgba(0, 255, 65, ${p.alpha * 0.6})`;
          p.char = String.fromCharCode(0x30A0 + Math.random() * 96);
          ctx.fillText(p.char, p.x, p.y);
          p.y += p.vy;
          if (p.y > canvas.height) {
            p.y = -20;
            p.alpha = Math.random();
          }
        }
      } else if (effect === "scanlines") {
        ctx.fillStyle = "rgba(0, 255, 0, 0.015)";
        for (let y = 0; y < canvas.height; y += 3) {
          ctx.fillRect(0, y, canvas.width, 1);
        }
      } else if (effect === "void-particles" || effect === "glass-orbs") {
        const color = currentVibe.glowColor ?? "#8855ff";
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${Math.round(p.alpha * 255).toString(16).padStart(2, "0")}`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grad.addColorStop(0, `${color}20`);
          grad.addColorStop(1, `${color}00`);
          ctx.fillStyle = grad;
          ctx.fill();
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          p.alpha += (Math.random() - 0.5) * 0.02;
          p.alpha = Math.max(0.05, Math.min(0.5, p.alpha));
        }
      } else if (effect === "cyber-grid" || effect === "synth-grid") {
        const color = currentVibe.glowColor ?? "#00f0ff";
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${Math.round(p.alpha * 255).toString(16).padStart(2, "0")}`;
          ctx.fill();
          p.x += p.vx;
          p.y += p.vy;
          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        }
        ctx.strokeStyle = `${color}08`;
        ctx.lineWidth = 0.5;
        const gridSize = 60;
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentVibe]);

  if (!currentVibe.backgroundEffect) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
