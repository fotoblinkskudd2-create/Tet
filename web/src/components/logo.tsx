import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-2 font-semibold", className)}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-[linear-gradient(135deg,oklch(0.55_0.24_300),oklch(0.6_0.22_340))] text-white shadow-md shadow-primary/30 transition-transform group-hover:rotate-6">
        <span className="text-lg leading-none">✦</span>
      </span>
      <span className="text-lg tracking-tight">
        Tet<span className="text-muted-foreground">.studio</span>
      </span>
    </Link>
  );
}
