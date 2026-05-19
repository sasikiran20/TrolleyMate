"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Info, ArrowLeft, Database, Shield, RefreshCw, FlaskConical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FiltersSheet, DEFAULT_FILTERS, type FilterState } from "@/components/filters-sheet";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { SortMenu, type SortKey } from "@/components/sort-menu";
import { ProductCard } from "@/components/product-card";
import { useLocation } from "@/hooks/use-location";
import { useSearch } from "@/hooks/use-search-cache";
import { pushRecent } from "@/components/recent-searches";
import { STORES, type StoreId } from "@/lib/stores";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function priceBandMatch(price: number, band: FilterState["priceBand"]) {
  if (band === "any") return true;
  if (band === "lt5") return price < 5;
  if (band === "5to10") return price >= 5 && price < 10;
  if (band === "10to20") return price >= 10 && price < 20;
  return price >= 20;
}

function applyFilters(products: Product[], f: FilterState): Product[] {
  return products
    .map((p) => {
      let offers = p.offers;
      if (f.hideOOS) offers = offers.filter((o) => o.inStock);
      if (f.stores.length) offers = offers.filter((o) => f.stores.includes(o.storeId));
      if (f.channel !== "any") offers = offers.filter((o) => o.channel === f.channel);
      offers = offers.filter((o) => priceBandMatch(o.price, f.priceBand));
      return { ...p, offers };
    })
    .filter((p) => p.offers.length > 0);
}

function applySort(products: Product[], key: SortKey, fastest: boolean): Product[] {
  const arr = [...products];
  const cheapest = (p: Product) => Math.min(...p.offers.map((o) => o.price));
  const dearest = (p: Product) => Math.max(...p.offers.map((o) => o.price));
  const unit = (p: Product) => {
    const n = p.sizeUnit === "kg" ? p.sizeValue * 1000 : p.sizeUnit === "L" ? p.sizeValue * 1000 : p.sizeValue;
    return cheapest(p) / Math.max(n, 1);
  };
  switch (key) {
    case "price-asc": arr.sort((a, b) => cheapest(a) - cheapest(b)); break;
    case "price-desc": arr.sort((a, b) => dearest(b) - dearest(a)); break;
    case "stores": arr.sort((a, b) => b.offers.length - a.offers.length); break;
    case "value": arr.sort((a, b) => unit(a) - unit(b)); break;
    default: break;
  }
  if (fastest) {
    arr.sort((a, b) => {
      const aFast = a.offers.some((o) => /today|same/i.test(o.eta));
      const bFast = b.offers.some((o) => /today|same/i.test(o.eta));
      return aFast === bFast ? 0 : aFast ? -1 : 1;
    });
  }
  return arr;
}

function countActive(f: FilterState): number {
  let n = 0;
  if (!f.hideOOS) n++;
  if (f.stores.length) n++;
  if (f.priceBand !== "any") n++;
  if (f.channel !== "any") n++;
  if (f.fastestFirst) n++;
  return n;
}

function ActiveChips({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.channel !== "any") {
    chips.push({
      key: "channel",
      label: filters.channel === "online" ? "Online only" : "In-store only",
      onRemove: () => onChange({ ...filters, channel: "any" }),
    });
  }
  if (filters.priceBand !== "any") {
    const label =
      filters.priceBand === "lt5" ? "Under $5"
      : filters.priceBand === "5to10" ? "$5–10"
      : filters.priceBand === "10to20" ? "$10–20"
      : "$20+";
    chips.push({ key: "price", label, onRemove: () => onChange({ ...filters, priceBand: "any" }) });
  }
  if (filters.fastestFirst) {
    chips.push({ key: "fast", label: "Fastest first", onRemove: () => onChange({ ...filters, fastestFirst: false }) });
  }
  if (!filters.hideOOS) {
    chips.push({ key: "oos", label: "Include out of stock", onRemove: () => onChange({ ...filters, hideOOS: true }) });
  }
  for (const s of filters.stores) {
    const meta = STORES[s as StoreId];
    if (!meta) continue;
    chips.push({
      key: `store-${s}`,
      label: meta.name,
      onRemove: () => onChange({ ...filters, stores: filters.stores.filter((x) => x !== s) }),
    });
  }
  if (chips.length === 0) return null;
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Active:</span>
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={c.onRemove}
          className="inline-flex items-center gap-1 rounded-full bg-[color:var(--primary)]/15 border border-[color:var(--primary)]/40 px-2.5 py-0.5 text-[11px] font-medium hover:bg-[color:var(--primary)]/25 transition-colors"
        >
          {c.label}
          <X className="size-3" />
        </button>
      ))}
      <button
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="text-[11px] text-[color:var(--link)] hover:underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
}

function DataStatusBanner({ data }: { data: import("@/lib/types").SearchResponse | null }) {
  if (!data) return null;
  const live = data.liveOfferCount ?? 0;
  const status = data.retailerStatus ?? [];
  const liveRetailers = status.filter((s) => s.ok && s.count > 0).map((s) => STORES[s.storeId as keyof typeof STORES]?.shortName ?? s.storeId);

  return (
    <div className={`rounded-lg border ${live > 0 ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/8" : "border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10"} px-3 py-2 text-[12px]`}>
      <div className="flex items-start gap-2">
        {live > 0 ? (
          <span className="relative flex size-2 mt-1 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--success)] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[color:var(--success)]" />
          </span>
        ) : (
          <FlaskConical className="size-3.5 mt-0.5 shrink-0 text-[color:var(--primary-strong)]" />
        )}
        <span className="leading-snug">
          {live > 0 ? (
            <>
              <strong>{live} live offer{live === 1 ? "" : "s"} scraped just now</strong>{" "}
              from {liveRetailers.join(", ")}. Other retailers show typical 2025 prices.
            </>
          ) : (
            <>
              <strong>Showing typical 2025 AU prices.</strong> Live scrapers had no
              matches for this query. Try a more common term like &ldquo;milk&rdquo; or &ldquo;bread&rdquo;.
            </>
          )}
        </span>
      </div>
      <div className="mt-1.5 flex gap-x-3 gap-y-1 flex-wrap text-[10px]">
        {Object.values(STORES).map((store) => {
          const s = status.find((x) => x.storeId === store.id);
          const isLive = s?.ok && (s.count ?? 0) > 0;
          const isError = s && !s.ok;
          const cls = isLive
            ? "text-[color:var(--success)]"
            : isError
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground";
          const dotCls = isLive ? "bg-[color:var(--success)]" : isError ? "bg-amber-500" : "bg-muted-foreground/40";
          const tag = isLive ? `${s!.count}× · ${s!.ms}ms` : isError ? "wall-blocked" : "typical";
          return (
            <span key={store.id} className={`inline-flex items-center gap-1 ${cls}`} title={s?.error}>
              <span className={`size-1.5 rounded-full ${dotCls}`} />
              <span>{store.shortName}</span>
              <span className="tabular-nums opacity-70">{tag}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [location] = useLocation();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [draft, setDraft] = useState(q);

  useEffect(() => {
    setDraft(q);
    if (q) pushRecent(q);
  }, [q]);

  const { data, loading, error, fromCache, refetch } = useSearch(q, location);

  const filtered = useMemo(() => {
    if (!data) return [];
    return applySort(applyFilters(data.products, filters), sort, filters.fastestFirst);
  }, [data, filters, sort]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  return (
    <div className="pt-3 sm:pt-6 space-y-4 animate-in fade-in duration-300">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="sm:hidden grid place-items-center size-9 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <form
          onSubmit={submit}
          className="flex-1 flex rounded-full overflow-hidden bg-card border border-border shadow-sm focus-within:ring-2 focus-within:ring-[color:var(--primary)]/40 focus-within:border-foreground"
        >
          <div className="grid place-items-center pl-3.5 text-muted-foreground">
            <Search className="size-4" />
          </div>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Try Farmdale oat milk 1L, Tim Tams, salmon, Vegemite…"
            type="search"
            className="flex-1 px-2 py-2.5 text-sm bg-transparent text-foreground outline-none"
          />
          {draft && (
            <button
              type="button"
              onClick={() => setDraft("")}
              className="px-3 grid place-items-center text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="size-4" />
            </button>
          )}
        </form>
        <button
          onClick={refetch}
          className="hidden sm:grid place-items-center size-10 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground"
          title="Refresh prices"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      <div className="grid lg:grid-cols-[16rem_1fr] gap-6">
        <FiltersSidebar
          value={filters}
          onChange={setFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />

        <div className="space-y-3 min-w-0">
          <DataStatusBanner data={data} />

          <div className="rounded-lg border border-amber-200/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 px-3 py-2 flex items-start gap-2 text-[12px] text-amber-900 dark:text-amber-200">
            <Info className="size-3.5 mt-0.5 shrink-0" />
            <span>
              Prices and stock refresh every 30 min. Tap any retailer logo or external icon
              to open the live product on their website.
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>
                  <span className="font-bold tabular-nums">{filtered.length}</span>
                  <span className="text-muted-foreground"> products</span>
                  {q && (
                    <span className="text-muted-foreground"> for &ldquo;<span className="text-foreground font-medium">{q}</span>&rdquo;</span>
                  )}
                  <span className="text-muted-foreground"> · in {location}</span>
                </>
              )}
              {fromCache && data && (
                <Badge variant="muted" className="ml-2 text-[10px] gap-1 tracking-wider">
                  <Database className="size-3" /> CACHED
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="lg:hidden">
                <FiltersSheet
                  value={filters}
                  onChange={setFilters}
                  activeCount={countActive(filters)}
                />
              </span>
              <SortMenu value={sort} onChange={setSort} />
            </div>
          </div>

          <ActiveChips filters={filters} onChange={setFilters} />

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Something went wrong: {error}
            </div>
          ) : loading ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-base font-semibold">No matching products</div>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term or clear your filters.
                {countActive(filters) > 0 && (
                  <>
                    <br />
                    <button
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="text-[color:var(--link)] hover:underline mt-2 inline-block"
                    >
                      Clear all filters
                    </button>
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="pt-2 pb-4 text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center">
            <Shield className="size-3" />
            Aggregated for personal comparison only. Trademarks belong to their owners.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-10"><Skeleton className="h-10 w-full" /></div>}>
      <SearchInner />
    </Suspense>
  );
}
