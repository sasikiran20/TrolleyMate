import type { Browser } from "playwright-core";
import { launchChromium, devices } from "./chromium-launcher";
import type { ScrapedItem, ScraperResult } from "./types";

const IS_LAMBDA =
  !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.AWS_EXECUTION_ENV;

// Internal step timeouts tuned for Amplify's 30s gateway cap.
// Sum must stay under SLOW_TIMEOUT_MS (22s) in src/lib/scrapers/index.ts.
const HOMEPAGE_TIMEOUT = IS_LAMBDA ? 8_000 : 20_000;
const AKAMAI_WARMUP_MS = IS_LAMBDA ? 1_500 : 3_000;
const SEARCH_TIMEOUT = IS_LAMBDA ? 10_000 : 25_000;
const TILE_TIMEOUT = IS_LAMBDA ? 6_000 : 20_000;

/* Coles is behind Akamai Bot Manager. The challenge solves cleanly under an
 * iPhone device emulation, but the session state goes stale fast — so we
 * always launch a FRESH Chromium for each scrape. Slower (6–8 s) but never
 * gets flagged. Server-side cache (30 min) makes the user-visible cost minimal. */

export async function scrapeColes(query: string): Promise<ScraperResult> {
  const start = Date.now();
  let browser: Browser | null = null;
  try {
    browser = await launchChromium();
    const ctx = await browser.newContext({
      ...devices["iPhone 13"],
      locale: "en-AU",
      timezoneId: "Australia/Sydney",
      extraHTTPHeaders: { "Accept-Language": "en-AU,en;q=0.9" },
    });
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    const page = await ctx.newPage();

    // Step 1: prime Akamai cookies on the homepage
    await page.goto("https://www.coles.com.au/", { waitUntil: "domcontentloaded", timeout: HOMEPAGE_TIMEOUT });
    await page.waitForTimeout(AKAMAI_WARMUP_MS);

    // Step 2: search
    await page.goto(`https://www.coles.com.au/search?q=${encodeURIComponent(query)}`, {
      waitUntil: "domcontentloaded",
      timeout: SEARCH_TIMEOUT,
    });

    const found = await page
      .waitForSelector('[data-testid="product-tile"]', { timeout: TILE_TIMEOUT })
      .then(() => true)
      .catch(() => false);
    if (!found) {
      throw new Error(`Akamai challenge unresolved (${(await page.content()).length} bytes)`);
    }

    const raw = await page.evaluate(() => {
      const tiles = document.querySelectorAll('[data-testid="product-tile"]');
      const out: {
        name: string;
        brand: string;
        priceText: string;
        wasText?: string;
        unitText?: string;
        promo?: string;
        image?: string;
        href?: string;
      }[] = [];
      tiles.forEach((tile) => {
        const name = tile.querySelector(".product__title")?.textContent?.trim() ?? "";
        const brand = tile.querySelector(".product__brand")?.textContent?.trim() ?? "";
        const price = tile.querySelector(".price__value")?.textContent?.trim() ?? "";
        const wasText = tile.querySelector(".price__was")?.textContent?.trim();
        const unitText =
          tile.querySelector(".price__calculation_method")?.textContent?.trim() ??
          tile.querySelector(".price__calculation_additional_info")?.textContent?.trim();
        const promo = tile.querySelector(".product-hat__title, .product-hat")?.textContent?.trim();
        const image = (tile.querySelector("img") as HTMLImageElement | null)?.src;
        const href =
          (tile.querySelector("a.product__link") as HTMLAnchorElement | null)?.getAttribute("href") ?? undefined;
        if (name) out.push({ name, brand, priceText: price, wasText, unitText, promo, image, href });
      });
      return out;
    });

    const items: ScrapedItem[] = [];
    for (const r of raw) {
      const priceMatch = r.priceText.match(/\$(\d+(?:\.\d{1,2})?)/);
      if (!priceMatch) continue;
      const price = parseFloat(priceMatch[1]);
      if (!price) continue;
      const wasMatch = r.wasText?.match(/\$(\d+(?:\.\d{1,2})?)/);
      const was = wasMatch ? parseFloat(wasMatch[1]) : undefined;
      const productUrl = r.href
        ? r.href.startsWith("http") ? r.href : `https://www.coles.com.au${r.href}`
        : `https://www.coles.com.au/search?q=${encodeURIComponent(query)}`;
      items.push({
        storeId: "coles",
        name: r.name,
        brand: r.brand || undefined,
        price,
        was: was && was > price ? was : undefined,
        unitPriceLabel: r.unitText,
        imageUrl: r.image,
        productUrl,
        available: true,
        channel: "online",
        eta: "Same day",
        promoTag:
          r.promo && /down down/i.test(r.promo) ? "Down Down"
          : r.promo && /special/i.test(r.promo) ? "Special"
          : r.promo,
      });
    }

    return { storeId: "coles", ok: items.length > 0, items, ms: Date.now() - start };
  } catch (e) {
    return {
      storeId: "coles",
      ok: false,
      items: [],
      ms: Date.now() - start,
      error: e instanceof Error ? e.message : "unknown",
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
