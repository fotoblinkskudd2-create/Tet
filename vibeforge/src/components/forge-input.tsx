"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, Wand2, Loader2 } from "lucide-react";
import { useVibe } from "@/context/vibe-context";

interface ForgeInputProps {
  onForge: (input: string) => void;
  isForging: boolean;
}

export function ForgeInput({ onForge, isForging }: ForgeInputProps) {
  const [input, setInput] = useState("");
  const { currentVibe } = useVibe();

  const placeholder = `Describe your app + vibe...\n\nExample: "${currentVibe.name.toLowerCase()} habit tracker with ${currentVibe.tagline.toLowerCase()} stats and animated progress bars"`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div
        className="relative overflow-hidden rounded-2xl border backdrop-blur-sm"
        style={{
          borderColor: "var(--vf-border)",
          background: "var(--vf-card)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 0%, var(--vf-primary), transparent 70%)`,
          }}
        />
        <div className="relative">
          <div
            className="flex items-center gap-2 border-b px-5 py-3"
            style={{ borderColor: "var(--vf-border)" }}
          >
            <Wand2 className="h-4 w-4" style={{ color: "var(--vf-primary)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--vf-fg)" }}
            >
              Describe Your App
            </span>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                background: `color-mix(in srgb, var(--vf-primary) 15%, transparent)`,
                color: "var(--vf-primary)",
              }}
            >
              {currentVibe.name} Mode
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className="w-full resize-none border-0 bg-transparent px-5 py-4 text-sm outline-none placeholder:opacity-40"
            style={{
              color: "var(--vf-fg)",
              fontFamily: "var(--vf-font)",
            }}
          />

          <div
            className="flex items-center justify-between border-t px-5 py-3"
            style={{ borderColor: "var(--vf-border)" }}
          >
            <span
              className="text-xs"
              style={{ color: "var(--vf-muted-fg)" }}
            >
              {input.length} characters
            </span>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!input.trim() || isForging}
              onClick={() => onForge(input)}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, var(--vf-primary), var(--vf-accent))`,
                color: "var(--vf-primary-fg)",
                boxShadow: input.trim() && !isForging
                  ? `0 4px 20px color-mix(in srgb, var(--vf-primary) 40%, transparent)`
                  : "none",
              }}
            >
              <AnimatePresence mode="wait">
                {isForging ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ rotate: { repeat: Infinity, duration: 1, ease: "linear" } }}
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="hammer"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <Hammer className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              {isForging ? "Forging..." : "Forge"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
