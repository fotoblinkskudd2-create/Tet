"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CREATIVE_RECIPES, MEDIUMS, type Medium } from "@/lib/prompt-engine";
import { cn } from "@/lib/utils";

export function OnboardingForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [fav, setFav] = useState<Medium | null>(null);
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name }),
      });
      if (!res.ok) throw new Error();
      toast.success("You're all set — welcome to Tet 🎉");
      router.push(fav ? `/dashboard/new?medium=${fav}` : "/dashboard");
      router.refresh();
    } catch {
      toast.error("Something hiccuped — try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">What should we call you?</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label>What do you create most? (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {MEDIUMS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFav(fav === m ? null : m)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                fav === m
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span className="mr-1">{CREATIVE_RECIPES[m].emoji}</span>
              {CREATIVE_RECIPES[m].title.replace(" prompt", "")}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={finish}
        disabled={loading || !name.trim()}
        variant="gradient"
        size="lg"
        className="w-full"
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        Enter the studio <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
