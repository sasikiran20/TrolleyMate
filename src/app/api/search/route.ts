import { NextResponse } from "next/server";
import { aggregateSearch } from "@/lib/scrapers";
import type { SearchResponse, Product } from "@/lib/types";
import type { StoreId } from "@/lib/stores";

// Chromium scrape can take 10–25s; force Node runtime and allow up to 60s.
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/* /api/search — Live aggregator (no sample data).
 *   Woolworths · Coles · ALDI · IGA scraped directly from their public sites.
 *   Costco kept in the retailer list but membership-walled, returns no offers.
 */

interface CacheEntry { data: AggregatedAndMerged; ts: number; }
interface AggregatedAndMerged {
  products: Product[];
  retailerStatus: { storeId: StoreId; ok: boolean; ms: number; count: number; error?: string }[];
}

const CACHE = new Map<string, CacheEntry>();
const TTL = 1000 * 60 * 30; // 30 min server-side cache
const MAX_ENTRIES = 200;

function cacheGet(k: string): AggregatedAndMerged | null {
  const hit = CACHE.get(k);
  if (!hit) return null;
  if (Date.now() - hit.ts > TTL) {
    CACHE.delete(k);
    return null;
  }
  return hit.data;
}

function cacheSet(k: string, v: AggregatedAndMerged) {
  if (CACHE.size > MAX_ENTRIES) {
    const oldest = [...CACHE.entries()].sort((a, b) => a[1].ts - b[1].ts)[0]?.[0];
    if (oldest) CACHE.delete(oldest);
  }
  CACHE.set(k, { data: v, ts: Date.now() });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const location = searchParams.get("location") ?? "Sydney NSW 2000";

  if (!query) {
    const empty: SearchResponse & { retailerStatus: AggregatedAndMerged["retailerStatus"]; liveOfferCount: number } = {
      query,
      count: 0,
      location,
      scrapedAt: new Date().toISOString(),
      cached: false,
      dataSource: "live",
      products: [],
      retailerStatus: [],
      liveOfferCount: 0,
    };
    return NextResponse.json(empty);
  }

  const key = `${location}::${query.toLowerCase()}`;
  let merged = cacheGet(key);

  if (!merged) {
    merged = await aggregateSearch(query);
    cacheSet(key, merged);
  }

  const liveCount = merged.products.reduce(
    (n, p) => n + p.offers.filter((o) => o.isLive).length,
    0,
  );

  const response: SearchResponse & {
    retailerStatus: AggregatedAndMerged["retailerStatus"];
    liveOfferCount: number;
  } = {
    query,
    count: merged.products.length,
    location,
    scrapedAt: new Date().toISOString(),
    cached: false,
    dataSource: "live",
    products: merged.products,
    retailerStatus: merged.retailerStatus,
    liveOfferCount: liveCount,
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
  });
}
