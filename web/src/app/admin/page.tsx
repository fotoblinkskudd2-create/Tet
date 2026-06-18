import { Globe, Heart, Users, Wand2 } from "lucide-react";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureProfile } from "@/lib/profile";
import { CREATIVE_RECIPES } from "@/lib/prompt-engine";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { Profile, Prompt } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const profile = await ensureProfile();
  if (!profile) redirect("/sign-in");
  if (profile.role !== "admin") redirect("/dashboard");

  const admin = createAdminSupabase();
  const [{ data: prompts }, { data: profiles }] = await Promise.all([
    admin
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const allPrompts = (prompts ?? []) as Prompt[];
  const allProfiles = (profiles ?? []) as Profile[];

  const stats = [
    { label: "Creators", value: allProfiles.length, icon: Users },
    { label: "Prompts", value: allPrompts.length, icon: Wand2 },
    {
      label: "Public",
      value: allPrompts.filter((p) => p.is_public).length,
      icon: Globe,
    },
    {
      label: "Total likes",
      value: allPrompts.reduce((s, p) => s + (p.likes ?? 0), 0),
      icon: Heart,
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <DashboardNav isAdmin />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground">
            A bird&apos;s-eye view of everything happening in Tet.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allPrompts.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing yet.</p>
              )}
              {allPrompts.slice(0, 12).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.seed}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.author_name} · {timeAgo(p.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary">
                      {CREATIVE_RECIPES[p.medium]?.emoji} {p.medium}
                    </Badge>
                    {p.is_public ? (
                      <Badge variant="success">public</Badge>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent creators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allProfiles.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing yet.</p>
              )}
              {allProfiles.slice(0, 12).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {u.full_name ?? "Unnamed"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email ?? "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {u.role === "admin" && <Badge>admin</Badge>}
                    <Badge variant="secondary">{u.plan}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
