import type { Browser, BrowserContext } from "playwright-core";
import { launchChromium, devices } from "./chromium-launcher";

/* Singleton headless Chromium that survives between requests.
 * Coles uses Akamai Bot Manager — desktop fingerprints get flagged after
 * a handful of requests from the same IP, while iPhone fingerprints pass
 * cleanly. We use iPhone 13 device emulation for the shared context. */

let browserPromise: Promise<Browser> | null = null;
let contextPromise: Promise<BrowserContext> | null = null;

const STEALTH_INIT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  window.chrome = { runtime: {} };
  Object.defineProperty(navigator, 'languages', { get: () => ['en-AU', 'en'] });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
`;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchChromium();
  }
  return browserPromise;
}

export async function getContext(): Promise<BrowserContext> {
  if (!contextPromise) {
    contextPromise = (async () => {
      const browser = await getBrowser();
      const iPhone = devices["iPhone 13"];
      const ctx = await browser.newContext({
        ...iPhone,
        locale: "en-AU",
        timezoneId: "Australia/Sydney",
        extraHTTPHeaders: { "Accept-Language": "en-AU,en;q=0.9" },
      });
      await ctx.addInitScript(STEALTH_INIT);
      return ctx;
    })();
  }
  return contextPromise;
}

export async function resetContext() {
  if (contextPromise) {
    try { await (await contextPromise).close(); } catch {}
    contextPromise = null;
  }
}

export async function closeBrowser() {
  if (contextPromise) {
    try { await (await contextPromise).close(); } catch {}
    contextPromise = null;
  }
  if (browserPromise) {
    try { await (await browserPromise).close(); } catch {}
    browserPromise = null;
  }
}

if (typeof process !== "undefined") {
  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.once(sig, () => { void closeBrowser(); });
  }
}
