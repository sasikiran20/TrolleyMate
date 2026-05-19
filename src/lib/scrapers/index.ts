import type { Product, StoreOffer } from "../types";
import type { StoreId } from "../stores";
import { scrapeWoolworths } from "./woolworths";
import { scrapeIGA } from "./iga";
import { scrapeALDI } from "./aldi";
import { scrapeColes } from "./coles";
import type { ScrapedItem, ScraperResult } from "./types";

/* ============================================================================
 * Live aggregator — no sample data, no fallback prices.
 * Each retailer is scraped from its real site:
 *   • Woolworths — JSON API with cookie priming
 *   • Coles      — Playwright (Akamai Bot Manager)
 *   • ALDI       — Static HTML parser
 *   • IGA        — JSON API
 *   • Costco     — Membership-walled, no public catalog (skipped)
 * Any retailer that fails or returns no results simply doesn't appear in the
 * offer list for that product. We never invent prices.
 * ============================================================================ */

const FAST_TIMEOUT_MS = 8_000;   // JSON-API scrapers
const SLOW_TIMEOUT_MS = 35_000;  // Playwright-based scrapers (Coles)

function pickEmoji(name: string): { emoji: string; bg: string } {
  const n = name.toLowerCase();
  if (/milk|cream|cheese|butter|yogurt|yoghurt/.test(n)) return { emoji: "🥛", bg: "from-blue-50 to-sky-100" };
  if (/oat |almond|soy |plant/.test(n)) return { emoji: "🌾", bg: "from-amber-50 to-stone-200" };
  if (/egg/.test(n)) return { emoji: "🥚", bg: "from-yellow-50 to-amber-100" };
  if (/bread|loaf|bun|roll|bakery/.test(n)) return { emoji: "🍞", bg: "from-amber-100 to-orange-200" };
  if (/chicken|breast|thigh/.test(n)) return { emoji: "🍗", bg: "from-orange-50 to-amber-100" };
  if (/beef|mince|steak|lamb|pork/.test(n)) return { emoji: "🥩", bg: "from-red-100 to-rose-200" };
  if (/salmon|tuna|prawn|fish|seafood/.test(n)) return { emoji: "🐟", bg: "from-pink-100 to-orange-200" };
  if (/tomato/.test(n)) return { emoji: "🍅", bg: "from-rose-100 to-red-200" };
  if (/banana/.test(n)) return { emoji: "🍌", bg: "from-yellow-100 to-amber-200" };
  if (/apple/.test(n)) return { emoji: "🍎", bg: "from-pink-100 to-rose-200" };
  if (/avocado/.test(n)) return { emoji: "🥑", bg: "from-emerald-100 to-green-300" };
  if (/potato|carrot|onion|broccoli/.test(n)) return { emoji: "🥕", bg: "from-orange-100 to-red-200" };
  if (/rice|pasta|noodle|spaghetti|penne/.test(n)) return { emoji: "🍝", bg: "from-amber-50 to-yellow-100" };
  if (/coke|cola|pepsi|sprite|fanta|lemonade|soft drink|drink/.test(n)) return { emoji: "🥤", bg: "from-red-100 to-red-300" };
  if (/coffee|latte|espresso/.test(n)) return { emoji: "☕", bg: "from-amber-200 to-stone-300" };
  if (/chocolate|tim tam|cadbury|nestle|kit kat/.test(n)) return { emoji: "🍫", bg: "from-amber-100 to-stone-200" };
  if (/chip|crisp|cracker|biscuit|cookie/.test(n)) return { emoji: "🍘", bg: "from-amber-100 to-orange-200" };
  if (/toilet|tissue|paper towel/.test(n)) return { emoji: "🧻", bg: "from-sky-50 to-blue-100" };
  if (/laundry|detergent|wash/.test(n)) return { emoji: "🧺", bg: "from-blue-100 to-sky-200" };
  if (/dishwash|finish/.test(n)) return { emoji: "🧴", bg: "from-yellow-100 to-orange-200" };
  if (/vegemite/.test(n)) return { emoji: "🟫", bg: "from-amber-200 to-yellow-300" };
  if (/peanut|nutella|spread|jam/.test(n)) return { emoji: "🥜", bg: "from-amber-100 to-orange-200" };
  return { emoji: "🛒", bg: "from-stone-100 to-stone-300" };
}

function normalizeName(name: string, brand?: string): string {
  let n = name.toLowerCase();
  if (brand) n = n.replace(brand.toLowerCase(), "");
  n = n
    .replace(/\b\d+(\.\d+)?\s*(kg|g|ml|l|pack|pk|ea|each)\b/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return n;
}

function sizeFromName(name: string): { value: number; unit: "g" | "kg" | "ml" | "L" | "pack" | "ea" } {
  const m = name.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l|pk|pack)\b/i);
  if (m) {
    const v = parseFloat(m[1]);
    const u = m[2].toLowerCase();
    if (u === "kg") return { value: v, unit: "kg" };
    if (u === "g") return { value: v, unit: "g" };
    if (u === "l") return { value: v, unit: "L" };
    if (u === "ml") return { value: v, unit: "ml" };
    if (u === "pk" || u === "pack") return { value: v, unit: "pack" };
  }
  return { value: 1, unit: "ea" };
}

interface MergeBucket {
  key: string;
  display: ScrapedItem;
  imageUrl?: string;
  offersByStore: Map<StoreId, StoreOffer>;
}

function toOffer(it: ScrapedItem): StoreOffer {
  return {
    storeId: it.storeId,
    price: it.price,
    was: it.was,
    channel: it.channel,
    inStock: it.available,
    eta: it.eta,
    promoTag: it.promoTag,
    url: it.productUrl,
    isLive: true,
  };
}

function mergeLive(results: ScraperResult[]): Product[] {
  const buckets = new Map<string, MergeBucket>();
  for (const r of results) {
    if (!r.ok) continue;
    for (const it of r.items) {
      const key = it.barcode
        ? `gtin:${it.barcode}`
        : `nm:${normalizeName(it.name, it.brand)}|${(it.brand ?? "").toLowerCase()}`;
      const offer = toOffer(it);
      const existing = buckets.get(key);
      if (existing) {
        const prev = existing.offersByStore.get(it.storeId);
        if (!prev || offer.price < prev.price) existing.offersByStore.set(it.storeId, offer);
        if (!existing.imageUrl && it.imageUrl) existing.imageUrl = it.imageUrl;
        if (it.name.length > existing.display.name.length) existing.display = it;
      } else {
        const b: MergeBucket = { key, display: it, imageUrl: it.imageUrl, offersByStore: new Map() };
        b.offersByStore.set(it.storeId, offer);
        buckets.set(key, b);
      }
    }
  }
  const products: Product[] = [];
  for (const b of buckets.values()) {
    const offers = Array.from(b.offersByStore.values()).sort((a, b) => a.price - b.price);
    const { emoji, bg } = pickEmoji(b.display.name);
    const size = sizeFromName(b.display.name);
    products.push({
      id: b.key,
      name: b.display.name,
      brand: b.display.brand,
      category: "Grocery",
      sizeValue: size.value,
      sizeUnit: size.unit,
      imageEmoji: emoji,
      imageBg: bg,
      imageUrl: b.imageUrl,
      offers,
    });
  }
  // Sort: more retailers first, then cheapest
  products.sort((a, b) => {
    const dStores = b.offers.length - a.offers.length;
    if (dStores !== 0) return dStores;
    const aMin = Math.min(...a.offers.map((o) => o.price));
    const bMin = Math.min(...b.offers.map((o) => o.price));
    return aMin - bMin;
  });
  return products;
}

function timedTimeout(storeId: StoreId, ms: number): Promise<ScraperResult> {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ storeId, ok: false, items: [], ms, error: "timeout" }),
      ms,
    ),
  );
}

export interface AggregatedSearch {
  products: Product[];
  retailerStatus: { storeId: StoreId; ok: boolean; ms: number; count: number; error?: string }[];
}

export async function aggregateSearch(query: string): Promise<AggregatedSearch> {
  if (!query.trim()) {
    return { products: [], retailerStatus: [] };
  }

  const results = await Promise.all([
    Promise.race([scrapeWoolworths(query), timedTimeout("woolworths", FAST_TIMEOUT_MS)]),
    Promise.race([scrapeIGA(query), timedTimeout("iga", FAST_TIMEOUT_MS)]),
    Promise.race([scrapeALDI(query), timedTimeout("aldi", FAST_TIMEOUT_MS)]),
    Promise.race([scrapeColes(query), timedTimeout("coles", SLOW_TIMEOUT_MS)]),
  ]);

  const products = mergeLive(results);
  return {
    products,
    retailerStatus: results.map((r) => ({
      storeId: r.storeId,
      ok: r.ok,
      ms: r.ms,
      count: r.items.length,
      error: r.error,
    })),
  };
}
