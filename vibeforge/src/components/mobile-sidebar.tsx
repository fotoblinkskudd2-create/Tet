"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { VIBES } from "@/lib/vibes";
import { VibeCard } from "./vibe-card";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
        style={{ color: "var(--vf-muted-fg)" }}
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r lg:hidden"
              style={{
                borderColor: "var(--vf-border)",
                background: "var(--vf-bg)",
              }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: "var(--vf-border)" }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: "var(--vf-primary)" }} />
                  <span className="text-sm font-bold" style={{ color: "var(--vf-fg)" }}>
                    Vibes
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ color: "var(--vf-muted-fg)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <div className="flex flex-col gap-1">
                  {VIBES.map((vibe, i) => (
                    <motion.div
                      key={vibe.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setOpen(false)}
                    >
                      <VibeCard vibe={vibe} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
