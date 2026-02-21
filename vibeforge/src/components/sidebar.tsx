"use client";

import { motion } from "framer-motion";
import { VIBES } from "@/lib/vibes";
import { VibeCard } from "./vibe-card";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useVibe } from "@/context/vibe-context";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { currentVibe } = useVibe();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="relative flex flex-col border-r transition-all duration-300"
      style={{
        width: collapsed ? "64px" : "280px",
        borderColor: "var(--vf-border)",
        background: "var(--vf-bg)",
      }}
    >
      <div
        className="flex items-center gap-2 border-b p-4"
        style={{ borderColor: "var(--vf-border)" }}
      >
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Sparkles
              className="h-5 w-5"
              style={{ color: "var(--vf-primary)" }}
            />
            <span
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: "var(--vf-fg)" }}
            >
              Vibes
            </span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:opacity-80"
          style={{ color: "var(--vf-muted-fg)" }}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 pt-2">
            {VIBES.map((vibe) => (
              <motion.button
                key={vibe.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setCollapsed(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-all"
                style={{
                  background:
                    currentVibe.id === vibe.id ? vibe.colors.secondary : "transparent",
                  border:
                    currentVibe.id === vibe.id
                      ? `2px solid ${vibe.colors.primary}`
                      : "2px solid transparent",
                }}
                title={vibe.name}
              >
                {vibe.icon}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {VIBES.map((vibe, i) => (
              <motion.div
                key={vibe.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <VibeCard vibe={vibe} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
