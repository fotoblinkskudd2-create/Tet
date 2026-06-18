"use client";

import { Heart, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { CREATIVE_RECIPES } from "@/lib/prompt-engine";
import type { Prompt } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

export function CommunityFeed({
  initial,
  signedIn,
}: {
  initial: Prompt[];
  signedIn: boolean;
}) {
  const [prompts, setPrompts] = useState<Prompt[]>(initial);
  const [live, setLive] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel("public:prompts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "prompts",
          filter: "is_public=eq.true",
        },
        (payload) => {
          const next = payload.new as Prompt;
          setPrompts((cur) =>
            cur.some((p) => p.id === next.id) ? cur : [next, ...cur],
          );
          toast("✨ A new prompt just landed", { description: next.seed });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "prompts" },
        (payload) => {
          const updated = payload.new as Prompt;
          setPrompts((cur) =>
            updated.is_public
              ? cur.map((p) => (p.id === updated.id ? updated : p))
              : cur.filter((p) => p.id !== updated.id),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "prompts" },
        (payload) => {
          setPrompts((cur) => cur.filter((p) => p.id !== payload.old.id));
        },
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function like(id: string) {
    if (!signedIn) {
      toast("Sign in to cheer on creators", {
        description: "It takes a few seconds.",
      });
      return;
    }
    if (liked.has(id)) return;
    setLiked((s) => new Set(s).add(id));
    setPrompts((cur) =>
      cur.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
    );
    try {
      const res = await fetch(`/api/prompts/${id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Couldn't register your like.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center">
        <Badge variant={live ? "success" : "secondary"} className="gap-1.5">
          <Radio className={cn("size-3", live && "animate-pulse")} />
          {live ? "Live — updates in real time" : "Connecting…"}
        </Badge>
      </div>

      {prompts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            No public prompts yet — be the first to share one!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => {
            const recipe = CREATIVE_RECIPES[prompt.medium];
            return (
              <Card key={prompt.id} className="flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {recipe.emoji}{" "}
                      {recipe.title.replace(" prompt", "")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(prompt.created_at)}
                    </span>
                  </div>
                  <p className="font-medium leading-snug">{prompt.seed}</p>
                  <p className="line-clamp-4 flex-1 text-sm text-muted-foreground">
                    {prompt.body}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {prompt.author_name ?? "A Tet creator"}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <CopyButton value={prompt.body} size="sm" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => like(prompt.id)}
                      className={cn(
                        "ml-auto gap-1.5",
                        liked.has(prompt.id) && "text-rose-500",
                      )}
                    >
                      <Heart
                        className={cn(
                          "size-4",
                          liked.has(prompt.id) && "fill-current",
                        )}
                      />
                      {prompt.likes}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
