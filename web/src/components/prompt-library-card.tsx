"use client";

import { Globe, Loader2, Lock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CREATIVE_RECIPES } from "@/lib/prompt-engine";
import type { Prompt } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

export function PromptLibraryCard({ prompt }: { prompt: Prompt }) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(prompt.is_public);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const recipe = CREATIVE_RECIPES[prompt.medium];

  async function toggleShare() {
    setBusy(true);
    const next = !isPublic;
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: next }),
      });
      if (!res.ok) throw new Error();
      setIsPublic(next);
      toast.success(next ? "Now public in the feed" : "Back to private");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't update sharing.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this prompt? This can't be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't delete.");
      setBusy(false);
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {recipe.emoji} {recipe.title.replace(" prompt", "")}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {timeAgo(prompt.created_at)}
          </span>
        </div>
        <p className="font-medium leading-snug">{prompt.seed}</p>
        <p className="line-clamp-4 flex-1 text-sm text-muted-foreground">
          {prompt.body}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <CopyButton value={prompt.body} size="sm" />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleShare}
            disabled={busy || pending}
            className={cn(isPublic && "text-primary")}
          >
            {busy ? (
              <Loader2 className="animate-spin" />
            ) : isPublic ? (
              <Globe />
            ) : (
              <Lock />
            )}
            {isPublic ? "Public" : "Private"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={remove}
            disabled={busy || pending}
            className="ml-auto text-muted-foreground hover:text-destructive"
            aria-label="Delete prompt"
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
