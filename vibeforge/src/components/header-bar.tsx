"use client";

import { motion } from "framer-motion";
import { Zap, Github } from "lucide-react";
import { AmbientSound } from "./ambient-sound";
import { SettingsDialog } from "./settings-dialog";

export function HeaderBar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex h-14 shrink-0 items-center justify-between border-b px-4"
      style={{
        borderColor: "var(--vf-border)",
        background: `color-mix(in srgb, var(--vf-bg) 80%, transparent)`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(135deg, var(--vf-primary), var(--vf-accent))`,
          }}
        >
          <Zap className="h-4 w-4" style={{ color: "var(--vf-primary-fg)" }} />
        </motion.div>
        <div>
          <h1
            className="text-sm font-extrabold tracking-tight"
            style={{ color: "var(--vf-fg)" }}
          >
            VibeForge
          </h1>
          <p
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: "var(--vf-muted-fg)" }}
          >
            The Ultimate Vibe Coding Studio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AmbientSound />
        <div
          className="h-5 w-px"
          style={{ background: "var(--vf-border)" }}
        />
        <SettingsDialog />
        <motion.a
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--vf-muted-fg)" }}
        >
          <Github className="h-4 w-4" />
        </motion.a>
      </div>
    </motion.header>
  );
}
