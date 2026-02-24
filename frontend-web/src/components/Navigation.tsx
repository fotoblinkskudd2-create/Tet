"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Hjem", icon: "🏠" },
  { href: "/food", label: "Mat", icon: "🍎" },
  { href: "/weight", label: "Vekt", icon: "⚖️" },
  { href: "/meals", label: "Plan", icon: "📋" },
  { href: "/profile", label: "Profil", icon: "👤" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-6xl mx-auto flex items-center justify-around md:justify-start md:gap-1 py-2 px-2">
        <div className="hidden md:flex items-center gap-2 mr-8 px-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-lg text-primary-700">LeanLife</span>
        </div>

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition",
              pathname === item.href
                ? "text-primary-600 bg-primary-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <span className="text-lg md:text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
