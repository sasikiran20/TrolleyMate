"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MapPin, Heart, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/deals", label: "Deals", Icon: Tag },
  { href: "/saved", label: "Saved", Icon: Heart },
  { href: "/location", label: "Location", Icon: MapPin },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-md pb-safe"
    >
      <ul className="grid grid-cols-5 max-w-md mx-auto">
        {ITEMS.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active
                    ? "text-[color:var(--primary)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "fill-[color:var(--primary)]/15")} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
