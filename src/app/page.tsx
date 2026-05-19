"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search, Sparkles, TrendingDown, ArrowRight, ShieldCheck, BarChart3,
  Bell, Star, Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { STORE_LIST } from "@/lib/stores";
import { useLocation } from "@/hooks/use-location";
import { LocationSheet } from "@/components/location-sheet";
import { RecentSearches, pushRecent } from "@/components/recent-searches";

const TRENDING = ["Milk", "Bread", "Eggs", "Tomatoes", "Chicken Breast", "Coca-Cola", "Tim Tams", "Toilet Paper"];

const CATEGORIES = [
  { name: "Fruit & Veg", emoji: "🥬", color: "from-emerald-100 to-emerald-200" },
  { name: "Dairy", emoji: "🥛", color: "from-blue-100 to-sky-200" },
  { name: "Bakery", emoji: "🍞", color: "from-amber-100 to-orange-200" },
  { name: "Meat", emoji: "🍗", color: "from-rose-100 to-red-200" },
  { name: "Pantry", emoji: "🥫", color: "from-yellow-100 to-amber-200" },
  { name: "Drinks", emoji: "🥤", color: "from-fuchsia-100 to-pink-200" },
  { name: "Snacks", emoji: "🍪", color: "from-orange-100 to-amber-200" },
  { name: "Household", emoji: "🧻", color: "from-sky-100 to-indigo-200" },
];

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [location] = useLocation();

  function go(term: string) {
    const t = term.trim();
    if (!t) return;
    pushRecent(t);
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  return (
    <div className="space-y-10 sm:space-y-12 pt-4 sm:pt-8 animate-in fade-in duration-500">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1c1c1c] text-white shadow-2xl">
        <div className="absolute inset-0 dot-grid opacity-60" />
        <div className="absolute -right-16 -top-16 size-72 rounded-full bg-[color:var(--primary)]/20 blur-3xl" />
        <div className="absolute -left-12 -bottom-16 size-64 rounded-full bg-[color:var(--primary)]/10 blur-3xl" />

        <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-8 px-6 sm:px-10 lg:px-14 py-10 sm:py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold bg-[color:var(--primary)]/15 text-[color:var(--primary)] px-3 py-1 rounded-full">
              <Activity className="size-3" /> Live across 5 Aussie retailers
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.04]">
              One trolley.<br />
              <span className="text-[color:var(--primary)]">Live prices.</span><br />
              Always the cheapest.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/70 max-w-xl">
              Type any product and we scrape Woolworths, Coles, ALDI, IGA & Costco
              in real-time — no sample data, no stale prices.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); go(q); }}
              className="mt-7 flex items-stretch gap-2 sm:gap-3"
            >
              <div className="flex flex-1 items-center rounded-full bg-white shadow-xl ring-1 ring-black/5 focus-within:ring-4 focus-within:ring-[color:var(--primary)]/40 transition-shadow">
                <div className="grid place-items-center pl-5 pr-2 text-muted-foreground">
                  <Search className="size-5" />
                </div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Try 'Farmdale oat milk 1L' or 'Tim Tams'…"
                  className="flex-1 min-w-0 pl-1 pr-5 py-3.5 sm:py-4 text-sm sm:text-base bg-transparent text-foreground outline-none placeholder:text-muted-foreground/80"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[color:var(--primary)] hover:bg-[color:var(--primary-strong)] active:scale-[0.98] text-[color:var(--primary-foreground)] font-semibold px-6 sm:px-8 text-sm sm:text-base shadow-xl ring-1 ring-[color:var(--primary-strong)] transition-all"
              >
                Compare
              </button>
            </form>

            <div className="mt-4 flex items-center gap-3 flex-wrap text-xs text-white/70">
              <LocationSheet>
                <button className="inline-flex items-center gap-1 underline-offset-2 hover:underline hover:text-white">
                  📍 Prices for <span className="font-semibold text-white">{location}</span>
                </button>
              </LocationSheet>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" /> No login required</span>
              <span className="inline-flex items-center gap-1"><Bell className="size-3.5" /> Price-drop alerts</span>
            </div>
          </div>

          {/* Hero stats card */}
          <div className="lg:pl-6">
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
              {[
                { kpi: "Live", label: "Real-time scraping", icon: <Activity className="size-4" /> },
                { kpi: "5", label: "AU grocery retailers", icon: <Star className="size-4" /> },
                { kpi: "GTIN", label: "Cross-store matching", icon: <BarChart3 className="size-4" /> },
                { kpi: "30 min", label: "Cache TTL", icon: <Sparkles className="size-4" /> },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 backdrop-blur p-4">
                  <div className="text-white/60 text-xs flex items-center gap-1.5">{s.icon} {s.label}</div>
                  <div className="text-2xl font-bold mt-1 tabular-nums">{s.kpi}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING & RECENT */}
      <section className="space-y-6">
        <RecentSearches />
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-semibold inline-flex items-center gap-1.5">
              <TrendingDown className="size-4 text-[color:var(--primary-strong)]" /> Popular searches
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {TRENDING.map((t) => (
              <button
                key={t}
                onClick={() => go(t)}
                className="rounded-full bg-card border border-border px-3.5 py-1.5 text-xs font-medium hover:border-foreground hover:bg-[color:var(--primary)]/10 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold tracking-tight">Shop by category</h2>
          <Link href="/search" className="text-sm font-medium text-[color:var(--link)] hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href={`/search?q=${encodeURIComponent(c.name)}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 sm:p-4 hover:border-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className={`grid place-items-center size-14 sm:size-16 rounded-xl bg-gradient-to-br ${c.color} text-3xl sm:text-4xl group-hover:scale-110 transition-transform`}>
                {c.emoji}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-center leading-tight">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* RETAILERS — 5 grocery only */}
      <section>
        <div className="flex items-end justify-between mb-4 px-1 gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Retailers we compare</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Live data scraped from each retailer&apos;s public site.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STORE_LIST.map((s) => (
            <a
              key={s.id}
              href={s.searchUrl("milk")}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl bg-card border border-border p-4 hover:border-foreground hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className={`grid place-items-center size-10 rounded-lg font-bold text-xs ${s.chip}`}
                >
                  {s.shortName.slice(0, 2).toUpperCase()}
                </div>
                <div className="leading-tight min-w-0">
                  <div className="text-sm font-bold truncate">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{s.host}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{s.deliveryEta}</span>
                <span className="text-[color:var(--link)] opacity-0 group-hover:opacity-100 transition-opacity">Visit →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <h2 className="text-lg font-bold tracking-tight">How TrolleyMate works</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { n: "01", icon: "🔍", title: "Search any product", body: "Type a brand, item or category — we scrape every retailer in parallel." },
            { n: "02", icon: "💰", title: "Compare side-by-side", body: "Same product matched across stores by GTIN barcode. CHEAPEST tag spots the winner." },
            { n: "03", icon: "🛒", title: "Buy direct", body: "Tap through to the retailer — you pay them, we don’t touch your money." },
          ].map((step) => (
            <Card key={step.n} className="product-card relative overflow-hidden">
              <CardContent className="p-5">
                <div className="absolute right-3 top-2 text-[64px] font-black text-foreground/[0.04] tabular-nums leading-none select-none pointer-events-none">
                  {step.n}
                </div>
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="font-bold mb-1.5 text-base">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.body}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="rounded-2xl bg-[color:var(--primary)] text-[color:var(--primary-foreground)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Real prices. Right now.</h3>
          <p className="text-sm text-black/70 mt-1">No account. No tracking. Add to home screen and it opens like an app.</p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-[color:var(--secondary)] hover:bg-black text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Start comparing <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
