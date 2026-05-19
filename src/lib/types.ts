import type { StoreId } from "./stores";

export type Channel = "online" | "in-store";

export interface StoreOffer {
  storeId: StoreId;
  price: number;
  /** Original price for showing discount */
  was?: number;
  channel: Channel;
  inStock: boolean;
  /** Delivery / pickup ETA copy */
  eta: string;
  /** Distance to nearest store with stock when in-store */
  distanceKm?: number;
  /** Loyalty / promo tag e.g. "Member price" */
  promoTag?: string;
  /** Deep-link to the product on the retailer's site */
  url: string;
  /** True when this price was fetched live during the request. False for fallback data. */
  isLive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  sizeValue: number;
  sizeUnit: "g" | "kg" | "ml" | "L" | "pack" | "ea";
  imageEmoji: string;
  imageBg: string;
  /** Real product photo URL when one was scraped; falls back to emoji */
  imageUrl?: string;
  offers: StoreOffer[];
}

export interface SearchResponse {
  query: string;
  count: number;
  location: string;
  scrapedAt: string;
  /** True when results came from cache rather than fresh scrape */
  cached: boolean;
  products: Product[];
  /** "sample" for the seed catalog, "live" when at least one scraper succeeded */
  dataSource?: "sample" | "live";
  /** Per-retailer scrape outcomes for the current query */
  retailerStatus?: {
    storeId: string;
    ok: boolean;
    ms: number;
    count: number;
    error?: string;
  }[];
  /** Total number of offers that were scraped live this request */
  liveOfferCount?: number;
}
