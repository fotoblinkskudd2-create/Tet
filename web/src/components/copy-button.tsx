"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copy",
  className,
  variant = "outline",
  size = "sm",
}: {
  value: string;
  label?: string;
  className?: string;
  variant?: "outline" | "ghost" | "gradient" | "secondary";
  size?: "sm" | "default" | "icon";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied — paste it anywhere ✨");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  }

  return (
    <Button variant={variant} size={size} onClick={copy} className={cn(className)}>
      {copied ? <Check className="text-emerald-500" /> : <Copy />}
      {size !== "icon" && (copied ? "Copied" : label)}
    </Button>
  );
}
