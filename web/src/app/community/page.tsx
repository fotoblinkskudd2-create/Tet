import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { CommunityFeed } from "@/components/community-feed";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { Prompt } from "@/lib/types";

export const metadata = {
  title: "Community feed",
  description: "Live stream of creative prompts shared by the Tet community.",
};

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const { userId } = await auth();

  const supabase = createAdminSupabase();
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo href={userId ? "/dashboard" : "/"} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="gradient" size="sm">
              <Link href={userId ? "/dashboard/new" : "/sign-up"}>
                {userId ? "Create" : "Join free"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Community feed</h1>
          <p className="mt-2 text-muted-foreground">
            Fresh prompts from creators around the world — streaming in live.
          </p>
        </div>
        <CommunityFeed initial={(data ?? []) as Prompt[]} signedIn={!!userId} />
      </main>

      <SiteFooter />
    </div>
  );
}
