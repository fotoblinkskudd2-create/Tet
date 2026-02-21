"use client";

import { motion } from "framer-motion";
import { useVibe } from "@/context/vibe-context";
import type { VibeDefinition } from "@/lib/vibes";

export function VibeCard({ vibe }: { vibe: VibeDefinition }) {
  const { currentVibe, setVibe } = useVibe();
  const isActive = currentVibe.id === vibe.id;

  return (
    <motion.button
      onClick={() => setVibe(vibe.id)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="group relative w-full overflow-hidden rounded-xl p-3 text-left transition-all duration-300"
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${vibe.colors.card}, ${vibe.colors.secondary})`
          : "transparent",
        border: isActive
          ? `2px solid ${vibe.colors.primary}`
          : "2px solid transparent",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
          style={{ background: vibe.colors.secondary }}
        >
          {vibe.icon}
        </div>
        <div className="min-w-0">
          <p
            className="truncate text-sm font-bold"
            style={{ color: isActive ? vibe.colors.primary : vibe.colors.foreground }}
          >
            {vibe.name}
          </p>
          <p
            className="truncate text-xs"
            style={{ color: vibe.colors.mutedForeground }}
          >
            {vibe.tagline}
          </p>
        </div>
      </div>

      {isActive && (
        <motion.div
          layoutId="vibe-indicator"
          className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
          style={{ background: vibe.colors.primary, boxShadow: `0 0 8px ${vibe.colors.primary}` }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${vibe.colors.primary}10, ${vibe.colors.accent}10)`,
        }}
      />
    </motion.button>
  );
}
