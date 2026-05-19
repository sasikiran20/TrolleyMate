import type { ScrapedItem, ScraperResult } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/** Decode HTML entities found in the static HTML output. */
function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Pull text between `aria-label="…,"` (used on ALDI's product tiles). */
function pullAria(block: string, attr: string): string | undefined {
  const m = block.match(new RegExp(`${attr}[^>]*>\\s*<p aria-label="([^"]+?),?"`));
  if (m) return decode(m[1]);
  // Fallback: text content of the tagged element
  const m2 = block.match(new RegExp(`${attr}[^>]*>([\\s\\S]+?)<`));
  return m2 ? decode(m2[1].replace(/<[^>]+>/g, "")) : undefined;
}

export async function scrapeALDI(query: string, signal?: AbortSignal): Promise<ScraperResult> {
  const start = Date.now();
  try {
    const url = `https://www.aldi.com.au/results?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      signal,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-AU,en;q=0.9",
        Referer: "https://www.aldi.com.au/",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Each product is wrapped by `<a class="base-link product-tile__link ...">`
    const tiles = html.split('class="product-tile"').slice(1, 41); // skip first split (header), cap at 40

    const items: ScrapedItem[] = [];
    for (const t of tiles) {
      const block = t.slice(0, 4000);
      const brand = pullAria(block, "product-tile__brandname");
      const name = pullAria(block, "product-tile__name");
      const sizeBit = pullAria(block, "product-tile__selling-size-and-comparison");
      if (!name) continue;

      // Price — first $ amount in the block
      const priceMatch = block.match(/\$(\d+\.\d{2})/);
      if (!priceMatch) continue;
      const price = parseFloat(priceMatch[1]);
      if (!price) continue;

      // Image URL — ALDI uses lazy attrs, look for image src or data-src
      const imgMatch =
        block.match(/<img[^>]+(?:data-src|src)="([^"]+aldi[^"]+?)"/i) ||
        block.match(/<img[^>]+src="([^"]+)"/i);
      const imageUrl = imgMatch ? decode(imgMatch[1]) : undefined;

      // Href
      const hrefMatch = block.match(/href="([^"]+)"/);
      const href = hrefMatch ? hrefMatch[1] : null;
      const productUrl = href
        ? href.startsWith("http")
          ? href
          : `https://www.aldi.com.au${href}`
        : `https://www.aldi.com.au/results?q=${encodeURIComponent(query)}`;

      // Unit-price label (e.g. "$0.89 / 1L")
      const cupMatch = block.match(/product-tile__comparison-price[^>]*>([\s\S]+?)</);
      const unitPriceLabel = cupMatch ? decode(cupMatch[1].replace(/<[^>]+>/g, "")) : undefined;

      // Compose display name — ALDI splits brand & name fields
      const displayName = [brand ? brand.charAt(0) + brand.slice(1).toLowerCase() : "", name]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      items.push({
        storeId: "aldi",
        name: displayName || name,
        brand: brand
          ? brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase()
          : undefined,
        price,
        unitPriceLabel,
        imageUrl,
        productUrl,
        available: true,
        channel: "in-store", // ALDI AU has no online grocery — in-store only
        eta: "In-store",
        promoTag: sizeBit && /save|special/i.test(sizeBit) ? "Special" : undefined,
      });
    }

    return { storeId: "aldi", ok: true, items, ms: Date.now() - start };
  } catch (e) {
    return {
      storeId: "aldi",
      ok: false,
      items: [],
      ms: Date.now() - start,
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}
