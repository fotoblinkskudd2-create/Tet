"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Key, Eye, EyeOff } from "lucide-react";
import { useVibe } from "@/context/vibe-context";
import { toast } from "sonner";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const { apiKeys, setApiKey } = useVibe();
  const [showGrok, setShowGrok] = useState(false);
  const [showClaude, setShowClaude] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        style={{ color: "var(--vf-muted-fg)" }}
      >
        <Settings className="h-4 w-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border"
              style={{
                borderColor: "var(--vf-border)",
                background: "var(--vf-bg)",
                boxShadow: `0 25px 60px -12px color-mix(in srgb, var(--vf-primary) 15%, black)`,
              }}
            >
              <div
                className="flex items-center justify-between border-b px-6 py-4"
                style={{ borderColor: "var(--vf-border)" }}
              >
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" style={{ color: "var(--vf-primary)" }} />
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--vf-fg)" }}
                  >
                    Settings
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:opacity-80"
                  style={{ color: "var(--vf-muted-fg)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <label
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--vf-muted-fg)" }}
                  >
                    Grok API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showGrok ? "text" : "password"}
                      value={apiKeys.grok}
                      onChange={(e) => setApiKey("grok", e.target.value)}
                      placeholder="xai-..."
                      className="w-full rounded-xl border bg-transparent px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:ring-1"
                      style={{
                        borderColor: "var(--vf-border)",
                        color: "var(--vf-fg)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowGrok(!showGrok)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--vf-muted-fg)" }}
                    >
                      {showGrok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--vf-muted-fg)" }}
                  >
                    Claude API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showClaude ? "text" : "password"}
                      value={apiKeys.claude}
                      onChange={(e) => setApiKey("claude", e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full rounded-xl border bg-transparent px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:ring-1"
                      style={{
                        borderColor: "var(--vf-border)",
                        color: "var(--vf-fg)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowClaude(!showClaude)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--vf-muted-fg)" }}
                    >
                      {showClaude ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div
                  className="rounded-xl p-4 text-xs"
                  style={{
                    background: `color-mix(in srgb, var(--vf-primary) 8%, transparent)`,
                    color: "var(--vf-muted-fg)",
                  }}
                >
                  API keys are stored locally in your browser and never sent to our servers.
                  They enable AI-powered code generation directly from the Forge panel.
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    toast.success("Settings saved!");
                  }}
                  className="w-full rounded-xl py-2.5 text-sm font-bold transition-all"
                  style={{
                    background: `linear-gradient(135deg, var(--vf-primary), var(--vf-accent))`,
                    color: "var(--vf-primary-fg)",
                  }}
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
