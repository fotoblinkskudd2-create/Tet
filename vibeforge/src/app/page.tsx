"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { HeaderBar } from "@/components/header-bar";
import { ForgeInput } from "@/components/forge-input";
import { OutputPanel } from "@/components/output-panel";
import { BackgroundEffects } from "@/components/background-effects";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { useVibe } from "@/context/vibe-context";
import { generateForgeResult, type ForgeResult } from "@/lib/forge";

export default function Home() {
  const [forgeResult, setForgeResult] = useState<ForgeResult | null>(null);
  const [isForging, setIsForging] = useState(false);
  const { currentVibe } = useVibe();

  const handleForge = useCallback(
    async (input: string) => {
      setIsForging(true);
      setForgeResult(null);

      await new Promise((r) => setTimeout(r, 2800));

      const result = generateForgeResult(input, currentVibe.name);
      setForgeResult(result);
      setIsForging(false);
    },
    [currentVibe]
  );

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{
        background: "var(--vf-bg)",
        color: "var(--vf-fg)",
        fontFamily: "var(--vf-font)",
      }}
    >
      <BackgroundEffects />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center lg:hidden">
          <MobileSidebar />
          <div className="flex-1">
            <HeaderBar />
          </div>
        </div>
        <div className="hidden lg:block">
          <HeaderBar />
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="hidden lg:flex">
            <Sidebar />
          </div>

          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 lg:p-6">
              <ForgeInput onForge={handleForge} isForging={isForging} />
              <div
                className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border"
                style={{
                  borderColor: "var(--vf-border)",
                  background: `color-mix(in srgb, var(--vf-card) 80%, transparent)`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <OutputPanel result={forgeResult} isForging={isForging} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
