"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language: string;
  filename: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(code, {
          lang: language === "tsx" ? "tsx" : language === "prisma" ? "graphql" : language,
          theme: "vitesse-dark",
        });
        if (!cancelled) setHighlighted(html);
      } catch {
        if (!cancelled) setHighlighted("");
      }
    }
    highlight();
    return () => { cancelled = true; };
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor: "var(--vf-border)",
        background: "var(--vf-card)",
      }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-2"
        style={{ borderColor: "var(--vf-border)" }}
      >
        <span className="text-xs font-mono" style={{ color: "var(--vf-muted-fg)" }}>
          {filename}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:opacity-80"
          style={{ color: "var(--vf-muted-fg)" }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="max-h-96 overflow-auto p-4 text-sm">
        {highlighted ? (
          <div
            className="shiki-wrapper [&_pre]:!bg-transparent [&_code]:!text-sm [&_code]:!font-mono"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        ) : (
          <pre
            className="whitespace-pre-wrap font-mono text-sm"
            style={{ color: "var(--vf-fg)" }}
          >
            {code}
          </pre>
        )}
      </div>
    </motion.div>
  );
}
