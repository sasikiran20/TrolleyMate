import type { ScrapedItem, ScraperResult } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

interface IgaItem {
  productId?: string;
  sku?: string;
  name?: string;
  brand?: string;
  barcode?: string;
  available?: boolean;
  priceNumeric?: number;
  pricePerUnit?: string;
  tprPrice?: number | null;
  unitOfSize?: string;
  image?: { default?: string; templates?: { large?: string } };
}

interface IgaResp {
  items?: IgaItem[];
  count?: number;
}

export async function scrapeIGA(query: string, signal?: AbortSignal): Promise<ScraperResult> {
  const start = Date.now();
  // 32600 = a real IGA store ID (King Street, Newtown NSW). In production this is
  // looked up from the user's postcode via /api/storefront/stores?postcode=…
  const STORE_ID = "32600";
  const url = `https://www.igashop.com.au/api/storefront/stores/${STORE_ID}/search?q=${encodeURIComponent(query)}&take=24`;
  try {
    const res = await fetch(url, {
      signal,
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        "Accept-Language": "en-AU,en;q=0.9",
        Referer: "https://www.igashop.com.au/",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as IgaResp;
    const items: ScrapedItem[] = (data.items ?? [])
      .filter((p) => typeof p.priceNumeric === "number" && (p.priceNumeric ?? 0) > 0)
      .map((p) => {
        const onSale =
          typeof p.tprPrice === "number" && p.tprPrice! > 0 && p.tprPrice! < (p.priceNumeric ?? 0);
        return {
          storeId: "iga" as const,
          name: p.name ?? "Unknown",
          brand: p.brand,
          barcode: p.barcode,
          price: onSale ? p.tprPrice! : (p.priceNumeric as number),
          was: onSale ? p.priceNumeric : undefined,
          unitPriceLabel: p.pricePerUnit,
          imageUrl: p.image?.templates?.large ?? p.image?.default,
          productUrl: p.productId
            ? `https://www.igashop.com.au/product/${p.productId}`
            : `https://www.igashop.com.au/search?q=${encodeURIComponent(query)}`,
          available: p.available !== false,
          channel: "online" as const,
          eta: "Today",
          promoTag: onSale ? "Special" : undefined,
        };
      });
    return { storeId: "iga", ok: true, items, ms: Date.now() - start };
  } catch (e) {
    return {
      storeId: "iga",
      ok: false,
      items: [],
      ms: Date.now() - start,
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}
