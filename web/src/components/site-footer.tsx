import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <Logo />
        <p>Made with joy. © {new Date().getFullYear()} Tet Studio.</p>
        <p className="text-xs">Next.js · Supabase · Clerk · shadcn/ui</p>
      </div>
    </footer>
  );
}
