"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Eye, FileText, Download, CopyCheck,
  FolderTree, Database, Route, Sparkles, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { ForgeResult } from "@/lib/forge";
import { CodeBlock } from "./code-block";

interface OutputPanelProps {
  result: ForgeResult | null;
  isForging: boolean;
}

type Tab = "plan" | "code" | "preview" | "docs";

export function OutputPanel({ result, isForging }: OutputPanelProps) {
  const [tab, setTab] = useState<Tab>("plan");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "plan", label: "Plan", icon: <FolderTree className="h-3.5 w-3.5" /> },
    { id: "code", label: "Code", icon: <Code2 className="h-3.5 w-3.5" /> },
    { id: "preview", label: "Preview", icon: <Eye className="h-3.5 w-3.5" /> },
    { id: "docs", label: "Docs", icon: <FileText className="h-3.5 w-3.5" /> },
  ];

  const handleCopyAll = async () => {
    if (!result) return;
    const all = result.files
      .map((f) => `// === ${f.path} ===\n${f.content}`)
      .join("\n\n");
    await navigator.clipboard.writeText(all);
    toast.success("All files copied to clipboard!");
  };

  const handleDownloadZip = async () => {
    if (!result) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const file of result.files) {
      zip.file(file.path, file.content);
    }
    zip.file(
      "README.md",
      `# ${result.plan.appName}\n\n${result.plan.description}\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Features\n\n${result.plan.features.map((f) => `- ${f}`).join("\n")}\n`
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.plan.appName.toLowerCase()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ZIP downloaded!");
  };

  if (isForging) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <ForgeLoadingAnimation />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Sparkles className="h-16 w-16 opacity-10" style={{ color: "var(--vf-primary)" }} />
        </motion.div>
        <p className="text-center text-sm" style={{ color: "var(--vf-muted-fg)" }}>
          Describe your app idea and click <strong>Forge</strong> to generate a complete project
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        className="flex items-center gap-1 border-b px-4 py-2"
        style={{ borderColor: "var(--vf-border)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              background: tab === t.id
                ? `color-mix(in srgb, var(--vf-primary) 15%, transparent)`
                : "transparent",
              color: tab === t.id ? "var(--vf-primary)" : "var(--vf-muted-fg)",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--vf-muted-fg)" }}
          >
            <CopyCheck className="h-3.5 w-3.5" />
            Copy All
          </button>
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: `linear-gradient(135deg, var(--vf-primary), var(--vf-accent))`,
              color: "var(--vf-primary-fg)",
            }}
          >
            <Download className="h-3.5 w-3.5" />
            ZIP
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {tab === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <PlanSection
                icon={<Sparkles className="h-4 w-4" />}
                title={result.plan.appName}
                items={[result.plan.description]}
              />
              <PlanSection
                icon={<FolderTree className="h-4 w-4" />}
                title="Features"
                items={result.plan.features}
              />
              <PlanSection
                icon={<Database className="h-4 w-4" />}
                title="Data Model"
                items={result.plan.dataModel}
              />
              <PlanSection
                icon={<Route className="h-4 w-4" />}
                title="Routes"
                items={result.plan.routes}
              />
              <PlanSection
                icon={<Code2 className="h-4 w-4" />}
                title="Files"
                items={result.plan.files}
              />
            </motion.div>
          )}

          {tab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {result.files.map((file) => (
                <CodeBlock
                  key={file.path}
                  code={file.content}
                  language={file.language}
                  filename={file.path}
                />
              ))}
            </motion.div>
          )}

          {tab === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className="w-full overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--vf-border)" }}
              >
                <div
                  className="flex items-center gap-2 border-b px-4 py-2"
                  style={{ borderColor: "var(--vf-border)", background: "var(--vf-muted)" }}
                >
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/60" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                    <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-xs" style={{ color: "var(--vf-muted-fg)" }}>
                    localhost:3000
                  </span>
                </div>
                <div className="relative aspect-video w-full" style={{ background: "var(--vf-bg)" }}>
                  <PreviewMock appName={result.plan.appName} />
                </div>
              </div>
              <p className="text-xs" style={{ color: "var(--vf-muted-fg)" }}>
                Live preview mock — download ZIP and run locally for full experience
              </p>
            </motion.div>
          )}

          {tab === "docs" && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="prose prose-invert max-w-none space-y-4"
            >
              <div
                className="rounded-xl border p-6"
                style={{ borderColor: "var(--vf-border)", background: "var(--vf-card)" }}
              >
                <h2 className="text-xl font-bold" style={{ color: "var(--vf-fg)" }}>
                  {result.plan.appName} — Documentation
                </h2>
                <div className="mt-4 space-y-4 text-sm" style={{ color: "var(--vf-muted-fg)" }}>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--vf-fg)" }}>Quick Start</h3>
                    <div
                      className="mt-2 rounded-lg p-3 font-mono text-xs"
                      style={{ background: "var(--vf-muted)" }}
                    >
                      <p style={{ color: "var(--vf-primary)" }}>$ npm install</p>
                      <p style={{ color: "var(--vf-primary)" }}>$ npm run dev</p>
                      <p style={{ color: "var(--vf-muted-fg)" }}># Open http://localhost:3000</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--vf-fg)" }}>Tech Stack</h3>
                    <ul className="mt-2 list-disc pl-4 space-y-1">
                      <li>Next.js 15 with App Router</li>
                      <li>TypeScript (strict mode)</li>
                      <li>Tailwind CSS v4</li>
                      <li>Framer Motion for animations</li>
                      <li>Prisma ORM for database</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--vf-fg)" }}>Deploy</h3>
                    <div
                      className="mt-2 rounded-lg p-3 font-mono text-xs"
                      style={{ background: "var(--vf-muted)" }}
                    >
                      <p style={{ color: "var(--vf-primary)" }}>$ npx vercel</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PlanSection({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--vf-border)", background: "var(--vf-card)" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span style={{ color: "var(--vf-primary)" }}>{icon}</span>
        <h3 className="text-sm font-bold" style={{ color: "var(--vf-fg)" }}>
          {title}
        </h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2 text-xs"
            style={{ color: "var(--vf-muted-fg)" }}
          >
            <span style={{ color: "var(--vf-primary)" }}>›</span>
            <span className="font-mono">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function PreviewMock({ appName }: { appName: string }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div
        className="mb-4 flex items-center justify-between rounded-lg border px-4 py-3"
        style={{ borderColor: "var(--vf-border)", background: "var(--vf-card)" }}
      >
        <span className="text-sm font-bold" style={{ color: "var(--vf-primary)" }}>
          {appName}
        </span>
        <div className="flex gap-2">
          <div
            className="h-6 w-16 rounded-md"
            style={{ background: "var(--vf-muted)" }}
          />
          <div
            className="h-6 w-16 rounded-md"
            style={{ background: "var(--vf-primary)" }}
          />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="rounded-lg border p-3"
            style={{ borderColor: "var(--vf-border)", background: "var(--vf-card)" }}
          >
            <div
              className="mb-2 h-3 w-2/3 rounded"
              style={{ background: "var(--vf-muted)" }}
            />
            <div
              className="mb-1 h-2 w-full rounded"
              style={{ background: "var(--vf-muted)" }}
            />
            <div
              className="h-2 w-4/5 rounded"
              style={{ background: "var(--vf-muted)" }}
            />
            <div
              className="mt-3 h-8 w-full rounded-md"
              style={{
                background: `linear-gradient(135deg, var(--vf-primary), var(--vf-accent))`,
                opacity: 0.6,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ForgeLoadingAnimation() {
  const steps = [
    "Analyzing your vibe...",
    "Designing architecture...",
    "Generating components...",
    "Building data models...",
    "Crafting animations...",
    "Polishing the experience...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="h-16 w-16 rounded-2xl border-2"
          style={{
            borderColor: "var(--vf-primary)",
            borderTopColor: "transparent",
            boxShadow: `0 0 30px color-mix(in srgb, var(--vf-primary) 30%, transparent)`,
          }}
        />
        <Loader2
          className="absolute inset-0 m-auto h-6 w-6 animate-spin"
          style={{ color: "var(--vf-primary)" }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm font-medium"
          style={{ color: "var(--vf-primary)" }}
        >
          {steps[step]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
