"use client";

import Link from "next/link";
import { MapPin, Search, ScanLine, ChevronDown } from "lucide-react";
import { LocationSheet } from "./location-sheet";
import { useLocation } from "@/hooks/use-location";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

function Diamond({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD83A" />
          <stop offset="1" stopColor="#F5B800" />
        </linearGradient>
      </defs>
      <path d="M16 1.5l9.5 9.5L16 30.5 6.5 11z" fill="url(#d)" stroke="#0a0a0a" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M16 1.5L11.5 11h9z" fill="#0a0a0a" />
    </svg>
  );
}

export function AppHeader() {
  const [location] = useLocation();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-[color:var(--header)] text-[color:var(--header-foreground)] shadow-[0_4px_14px_-8px_rgba(0,0,0,0.6)]">
      <div className="pt-safe">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 sm:px-6 pt-3 pb-2 sm:py-3">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Diamond className="size-8 group-active:scale-95 transition-transform drop-shadow-sm" />
            <div className="leading-none hidden sm:block">
              <div className="text-[17px] font-bold tracking-tight">
                Trolley<span className="text-[color:var(--primary)]">Mate</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.24em] text-white/55 mt-0.5">Australia</div>
            </div>
          </Link>

          <LocationSheet>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-white/85 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0 group"
            >
              <MapPin className="size-3.5 text-[color:var(--primary)]" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[9px] uppercase tracking-wider text-white/50">Deliver to</span>
                <span className="font-semibold truncate max-w-[140px] sm:max-w-[220px]">{location}</span>
              </span>
              <ChevronDown className="size-3 text-white/40 group-hover:text-white/70 hidden sm:block" />
            </button>
          </LocationSheet>

          {/* Desktop search */}
          <form onSubmit={submit} className="hidden sm:flex flex-1 max-w-3xl mx-auto">
            <div className="flex w-full overflow-hidden rounded-md focus-within:ring-2 focus-within:ring-[color:var(--primary)] shadow-md">
              <select
                aria-label="Category"
                className="bg-[#2c2c2c] text-white/85 text-xs px-3 border-r border-white/10 outline-none cursor-pointer hover:bg-[#363636] transition-colors"
                defaultValue="all"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v !== "all") router.push(`/search?q=${encodeURIComponent(v)}`);
                }}
              >
                <option value="all">All</option>
                <option value="Fruit & Veg">Fruit & Veg</option>
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
                <option value="Meat">Meat</option>
                <option value="Pantry">Pantry</option>
                <option value="Drinks">Drinks</option>
                <option value="Snacks">Snacks</option>
                <option value="Household">Household</option>
              </select>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Search 18,000+ AU grocery products"
                className="flex-1 px-4 py-2.5 text-sm bg-white text-foreground outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="bg-[color:var(--primary)] hover:bg-[color:var(--primary-strong)] text-[#0a0a0a] px-5 grid place-items-center transition-colors"
              >
                <Search className="size-5" strokeWidth={2.6} />
              </button>
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 text-sm shrink-0">
            {[
              { href: "/", label: "Home" },
              { href: "/search", label: "All products" },
              { href: "/deals", label: "Deals" },
              { href: "/saved", label: "Watchlist" },
            ].map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile search row */}
        <form onSubmit={submit} className="sm:hidden px-3 pb-3">
          <div className="flex rounded-full overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-[color:var(--primary)]">
            <div className="grid place-items-center pl-3 text-muted-foreground">
              <Search className="size-4" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search milk, bread, eggs…"
              className="flex-1 px-2 py-2.5 text-sm bg-white text-foreground outline-none"
            />
            <button type="button" aria-label="Scan barcode" className="px-3 grid place-items-center text-muted-foreground">
              <ScanLine className="size-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Category strip */}
      <nav className="bg-[color:var(--header-secondary)] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-2 sm:px-6">
          <ul className="flex gap-1 overflow-x-auto no-scrollbar py-1.5 text-[12px] sm:text-[13px] text-white/80">
            {["Fruit & Veg", "Dairy", "Bakery", "Meat", "Pantry", "Drinks", "Snacks", "Household", "Baby", "Pet"].map((c) => (
              <li key={c}>
                <Link
                  href={`/search?q=${encodeURIComponent(c)}`}
                  className="block whitespace-nowrap px-3 py-1.5 rounded-md hover:bg-white/10 hover:text-white transition-colors"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
