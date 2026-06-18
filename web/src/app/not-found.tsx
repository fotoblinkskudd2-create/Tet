import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-aurora px-4 text-center">
      <div className="space-y-6">
        <Logo />
        <div>
          <p className="text-6xl font-bold text-gradient">404</p>
          <p className="mt-2 text-muted-foreground">
            This prompt wandered off the page.
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/">Back to Tet</Link>
        </Button>
      </div>
    </div>
  );
}
