"use client";

import { Loader2, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  buildCreativePrompt,
  CREATIVE_RECIPES,
  MEDIUMS,
  type Medium,
} from "@/lib/prompt-engine";
import { cn } from "@/lib/utils";

const MEDIUM_OPTIONS: { value: Medium | "auto"; label: string; emoji: string }[] =
  [
    { value: "auto", label: "Auto", emoji: "✨" },
    ...MEDIUMS.map((m) => ({
      value: m,
      label: CREATIVE_RECIPES[m].title.replace(" prompt", ""),
      emoji: CREATIVE_RECIPES[m].emoji,
    })),
  ];

const EXAMPLES = [
  "misty forest boardwalk at dawn",
  "uplifting synthwave for a launch video",
  "a poem about late-summer rain in the city",
  "neon koi swimming through a rainy alley",
];

export function PromptGenerator({ canSave = false }: { canSave?: boolean }) {
  const router = useRouter();
  const [seed, setSeed] = useState("");
  const [medium, setMedium] = useState<Medium | "auto">("auto");
  const [saving, setSaving] = useState(false);

  const prompt = useMemo(() => {
    if (!seed.trim()) return null;
    try {
      return buildCreativePrompt(seed, medium === "auto" ? null : medium);
    } catch {
      return null;
    }
  }, [seed, medium]);

  async function save(makePublic: boolean) {
    if (!prompt) return;
    setSaving(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seed,
          medium: medium === "auto" ? null : medium,
          is_public: makePublic,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(
        makePublic ? "Shared to the community feed 🎉" : "Saved to your library",
      );
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Could not save — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="size-4 text-primary" /> Describe your idea
          </CardTitle>
          <CardDescription>
            A few words is all it takes. Pick a medium or let Tet auto-detect.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {MEDIUM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMedium(opt.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                  medium === opt.value
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <span className="mr-1">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seed">Your seed idea</Label>
            <Textarea
              id="seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. misty forest boardwalk at dawn"
              className="min-h-28 resize-none text-base"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setSeed(ex)}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {ex}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "overflow-hidden transition-opacity",
          !prompt && "opacity-70",
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Your prompt
            </span>
            {prompt && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                {prompt.emoji} {prompt.title}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Updates live as you type. Copy it straight into your tool of choice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {prompt ? (
            <>
              <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
                {prompt.body}
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {prompt.details.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/60" />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <CopyButton
                  value={prompt.body}
                  label="Copy prompt"
                  variant="gradient"
                />
                {canSave ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={saving}
                      onClick={() => save(false)}
                    >
                      {saving && <Loader2 className="animate-spin" />}
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={saving}
                      onClick={() => save(true)}
                    >
                      {saving && <Loader2 className="animate-spin" />}
                      Save & share
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/sign-up">Sign up to save</Link>
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="grid place-items-center rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
              <Sparkles className="mb-2 size-6 text-muted-foreground/50" />
              Start typing to watch your prompt build itself.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
