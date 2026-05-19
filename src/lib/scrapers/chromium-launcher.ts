import { chromium, type Browser, type LaunchOptions } from "playwright-core";

/* Chooses the right Chromium binary for the runtime.
 *   - On AWS Lambda / Amplify SSR: uses @sparticuz/chromium (slim build that fits Lambda).
 *   - Locally: uses the full `playwright` package's bundled Chromium. */

const IS_LAMBDA =
  !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
  !!process.env.AWS_EXECUTION_ENV ||
  process.env.USE_SPARTICUZ_CHROMIUM === "true";

const STEALTH_ARGS = [
  "--disable-blink-features=AutomationControlled",
  "--no-sandbox",
  "--disable-setuid-sandbox",
];

export async function launchChromium(extra: LaunchOptions = {}): Promise<Browser> {
  if (IS_LAMBDA) {
    const sparticuz = (await import("@sparticuz/chromium")).default;
    const executablePath = await sparticuz.executablePath();
    return chromium.launch({
      args: [...sparticuz.args, ...STEALTH_ARGS],
      executablePath,
      headless: true,
      ...extra,
    });
  }

  // Local dev: rely on the full `playwright` package being installed.
  const fullPlaywright = await import("playwright");
  return fullPlaywright.chromium.launch({
    headless: true,
    args: STEALTH_ARGS,
    ...extra,
  });
}

export { devices } from "playwright-core";
