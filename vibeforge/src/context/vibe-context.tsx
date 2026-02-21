"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { VibeDefinition, VIBES, getVibeById } from "@/lib/vibes";

interface VibeContextType {
  currentVibe: VibeDefinition;
  setVibe: (id: string) => void;
  apiKeys: { grok: string; claude: string };
  setApiKey: (provider: "grok" | "claude", key: string) => void;
}

const VibeContext = createContext<VibeContextType | null>(null);

export function VibeProvider({ children }: { children: React.ReactNode }) {
  const [currentVibe, setCurrentVibe] = useState<VibeDefinition>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("vibeforge-vibe");
      if (savedId) return getVibeById(savedId);
    }
    return VIBES[0];
  });

  const [apiKeys, setApiKeys] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vibeforge-keys");
      if (saved) {
        try { return JSON.parse(saved) as { grok: string; claude: string }; }
        catch { /* ignore */ }
      }
    }
    return { grok: "", claude: "" };
  });

  const setVibe = useCallback((id: string) => {
    const vibe = getVibeById(id);
    setCurrentVibe(vibe);
    if (typeof window !== "undefined") {
      localStorage.setItem("vibeforge-vibe", id);
    }
  }, []);

  const setApiKey = useCallback((provider: "grok" | "claude", key: string) => {
    setApiKeys((prev) => {
      const next = { ...prev, [provider]: key };
      if (typeof window !== "undefined") {
        localStorage.setItem("vibeforge-keys", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const c = currentVibe.colors;
    root.style.setProperty("--vf-bg", c.background);
    root.style.setProperty("--vf-fg", c.foreground);
    root.style.setProperty("--vf-primary", c.primary);
    root.style.setProperty("--vf-primary-fg", c.primaryForeground);
    root.style.setProperty("--vf-secondary", c.secondary);
    root.style.setProperty("--vf-secondary-fg", c.secondaryForeground);
    root.style.setProperty("--vf-accent", c.accent);
    root.style.setProperty("--vf-accent-fg", c.accentForeground);
    root.style.setProperty("--vf-muted", c.muted);
    root.style.setProperty("--vf-muted-fg", c.mutedForeground);
    root.style.setProperty("--vf-card", c.card);
    root.style.setProperty("--vf-card-fg", c.cardForeground);
    root.style.setProperty("--vf-border", c.border);
    root.style.setProperty("--vf-ring", c.ring);
    root.style.setProperty("--vf-glow", currentVibe.glowColor ?? c.primary);
    root.style.setProperty("--vf-font", currentVibe.fontFamily);
    root.style.fontFamily = currentVibe.fontFamily;
  }, [currentVibe]);

  return (
    <VibeContext.Provider value={{ currentVibe, setVibe, apiKeys, setApiKey }}>
      {children}
    </VibeContext.Provider>
  );
}

export function useVibe() {
  const ctx = useContext(VibeContext);
  if (!ctx) throw new Error("useVibe must be used within VibeProvider");
  return ctx;
}
