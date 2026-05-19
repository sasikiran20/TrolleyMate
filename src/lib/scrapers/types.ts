import type { StoreId } from "../stores";

/** A single product/offer scraped live from a retailer. */
export interface ScrapedItem {
  storeId: StoreId;
  name: string;
  brand?: string;
  /** GTIN-13 / EAN — used for cross-retailer matching */
  barcode?: string;
  price: number;
  was?: number;
  /** "$X.XX / 1L" or "$X.XX / 100g" from the retailer */
  unitPriceLabel?: string;
  imageUrl?: string;
  productUrl: string;
  available: boolean;
  channel: "online" | "in-store";
  eta: string;
  promoTag?: string;
}

export interface ScraperResult {
  storeId: StoreId;
  ok: boolean;
  items: ScrapedItem[];
  /** Latency for the scraper call in ms */
  ms: number;
  /** Human-readable error if `ok=false` */
  error?: string;
}
