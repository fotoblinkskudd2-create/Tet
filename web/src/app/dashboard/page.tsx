import { Globe, Plus, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { PromptLibraryCard } from "@/components/prompt-library-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ensureProfile } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Prompt } from "@/lib/types";

export const metadata = { title: "Library" };

export default async function DashboardPage() {
  const profile = await ensureProfile();
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false });

  const prompts = (data ?? []) as Prompt[];
  const publicCount = prompts.filter((p) => p.is_public).length;
  const totalLikes = prompts.reduce((sum, p) => sum + (p.likes ?? 0), 0);

  const stats = [
    { label: "Prompts", value: prompts.length, icon: Wand2 },
    { label: "Shared", value: publicCount, icon: Globe },
    { label: "Likes earned", value: totalLikes, icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hey {profile?.full_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-muted-foreground">
            Your prompt library, all in one place.
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/dashboard/new">
            <Plus className="size-4" /> New prompt
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {prompts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Wand2 className="size-7" />
            </span>
            <div>
              <h3 className="text-lg font-semibold">No prompts yet</h3>
              <p className="text-muted-foreground">
                Turn your first idea into a paste-ready brief.
              </p>
            </div>
            <Button asChild variant="gradient">
              <Link href="/dashboard/new">
                <Plus className="size-4" /> Create your first prompt
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptLibraryCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
