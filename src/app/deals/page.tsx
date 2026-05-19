"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "@/hooks/use-location";
import type { Product, SearchResponse } from "@/lib/types";

const DEALS_QUERIES = ["milk", "bread", "tim tam", "toilet paper", "vegemite", "weet-bix"];

export default function DealsPage() {
  const [location] = useLocation();
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Fetch a handful of common categories and keep only items with a `was` price
      const results: Product[] = [];
      for (const q of DEALS_QUERIES) {
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(q)}&location=${encodeURIComponent(location)}`,
            { cache: "no-store" },
          );
          if (!res.ok) continue;
          const data = (await res.json()) as SearchResponse;
          for (const p of data.products) {
            if (p.offers.some((o) => o.was && o.was > o.price)) {
              results.push(p);
              if (results.length >= 24) break;
            }
          }
          if (cancelled || results.length >= 24) break;
        } catch {/* skip */}
      }
      if (!cancelled) {
        setDeals(results);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [location]);

  return (
    <div className="pt-4 sm:pt-6 space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <div className="grid place-items-center size-10 rounded-xl bg-[color:var(--primary)]/15 text-[color:var(--primary)]">
          <Tag className="size-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">This week&apos;s deals</h1>
          <p className="text-sm text-muted-foreground">
            Live half-price specials, Down Down items and member offers scraped just now.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {loading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <Badge variant="success">{deals.length} live deals</Badge>
        )}
        <Link href="/search" className="text-[color:var(--link)] hover:underline inline-flex items-center gap-1">
          <Search className="size-3" /> Browse all products
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <div className="text-4xl mb-2">📭</div>
          <div className="text-base font-semibold">No live deals right now</div>
          <p className="text-sm text-muted-foreground mt-1">
            Retailers aren&apos;t advertising half-price specials on the queries we checked.
            Try{" "}
            <Link href="/search?q=milk" className="text-[color:var(--link)] hover:underline">
              searching directly
            </Link>{" "}
            for what you need.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {deals.map((p, i) => (
            <ProductCard key={`${p.id}-${i}`} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
