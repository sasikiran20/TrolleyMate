import type { ScrapedItem, ScraperResult } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/** Lightweight in-memory cookie jar — Akamai gives us valid cookies on a search-page GET. */
let cachedCookie: { value: string; expires: number } | null = null;

async function primeCookies(): Promise<string> {
  if (cachedCookie && cachedCookie.expires > Date.now()) return cachedCookie.value;
  const res = await fetch("https://www.woolworths.com.au/shop/search/products?searchTerm=milk", {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-AU,en;q=0.9",
    },
  });
  const set = (res.headers.getSetCookie?.() ?? []) as string[];
  const value = set.map((c) => c.split(";")[0]).join("; ");
  // Reuse cookies for 10 minutes
  cachedCookie = { value, expires: Date.now() + 10 * 60 * 1000 };
  return value;
}

interface WoolyProduct {
  Stockcode: number;
  Barcode?: string;
  Name?: string;
  DisplayName?: string;
  Brand?: string;
  UrlFriendlyName?: string;
  Price?: number | null;
  WasPrice?: number | null;
  CupString?: string;
  IsAvailable?: boolean;
  IsInStock?: boolean;
  IsOnSpecial?: boolean;
  IsHalfPrice?: boolean;
  LargeImageFile?: string;
}

async function doSearch(query: string, cookies: string, signal?: AbortSignal) {
  return fetch("https://www.woolworths.com.au/apis/ui/Search/products", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "User-Agent": UA,
      Referer: `https://www.woolworths.com.au/shop/search/products?searchTerm=${encodeURIComponent(query)}`,
      Origin: "https://www.woolworths.com.au",
      "Accept-Language": "en-AU,en;q=0.9",
      Cookie: cookies,
    },
    body: JSON.stringify({
      Filters: [],
      IsSpecial: false,
      Location: `/shop/search/products?searchTerm=${encodeURIComponent(query)}`,
      PageNumber: 1,
      PageSize: 24,
      SearchTerm: query,
      SortType: "TraderRelevance",
      IsRegisteredRewardsCardPromotion: null,
    }),
  });
}

export async function scrapeWoolworths(query: string, signal?: AbortSignal): Promise<ScraperResult> {
  const start = Date.now();
  try {
    let cookies = await primeCookies();
    let res = await doSearch(query, cookies, signal);

    // If the cached cookie went stale (403/401/429), invalidate and retry ONCE with fresh cookies
    if (res.status === 403 || res.status === 401 || res.status === 429) {
      cachedCookie = null;
      cookies = await primeCookies();
      res = await doSearch(query, cookies, signal);
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { Products?: { Products?: WoolyProduct[] }[] };

    const items: ScrapedItem[] = [];
    for (const group of json.Products ?? []) {
      for (const p of group.Products ?? []) {
        if (!p?.Price || p.Price <= 0) continue;
        const promo = p.IsHalfPrice ? "½ price" : p.IsOnSpecial ? "Special" : undefined;
        items.push({
          storeId: "woolworths",
          name: p.DisplayName ?? p.Name ?? "Unknown",
          brand: p.Brand,
          barcode: p.Barcode,
          price: p.Price,
          was: p.WasPrice && p.WasPrice > p.Price ? p.WasPrice : undefined,
          unitPriceLabel: p.CupString,
          imageUrl: p.LargeImageFile,
          productUrl: p.UrlFriendlyName
            ? `https://www.woolworths.com.au/shop/productdetails/${p.Stockcode}/${p.UrlFriendlyName}`
            : `https://www.woolworths.com.au/shop/search/products?searchTerm=${encodeURIComponent(query)}`,
          available: p.IsInStock !== false && p.IsAvailable !== false,
          channel: "online",
          eta: "Tomorrow",
          promoTag: promo,
        });
      }
    }
    return { storeId: "woolworths", ok: true, items, ms: Date.now() - start };
  } catch (e) {
    return {
      storeId: "woolworths",
      ok: false,
      items: [],
      ms: Date.now() - start,
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}
