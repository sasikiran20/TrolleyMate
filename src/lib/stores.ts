export type StoreId =
  | "woolworths"
  | "coles"
  | "aldi"
  | "iga"
  | "costco";

export interface StoreMeta {
  id: StoreId;
  name: string;
  shortName: string;
  /** Tailwind classes for chip background + text */
  chip: string;
  /** Solid brand colour for accents */
  brand: string;
  /** Estimated delivery / pickup copy */
  deliveryEta: string;
  /** Search URL for the retailer with {q} placeholder */
  searchUrl: (q: string) => string;
  /** Public-facing host (for display) */
  host: string;
}

const enc = (q: string) => encodeURIComponent(q.trim());

export const STORES: Record<StoreId, StoreMeta> = {
  woolworths: {
    id: "woolworths",
    name: "Woolworths",
    shortName: "Woolies",
    chip: "bg-[#178841] text-white",
    brand: "#178841",
    deliveryEta: "Tomorrow",
    host: "woolworths.com.au",
    searchUrl: (q) => `https://www.woolworths.com.au/shop/search/products?searchTerm=${enc(q)}`,
  },
  coles: {
    id: "coles",
    name: "Coles",
    shortName: "Coles",
    chip: "bg-[#E01A22] text-white",
    brand: "#E01A22",
    deliveryEta: "Same day",
    host: "coles.com.au",
    searchUrl: (q) => `https://www.coles.com.au/search?q=${enc(q)}`,
  },
  aldi: {
    id: "aldi",
    name: "ALDI",
    shortName: "ALDI",
    chip: "bg-[#00488A] text-white",
    brand: "#00488A",
    deliveryEta: "In-store",
    host: "aldi.com.au",
    searchUrl: (q) => `https://www.aldi.com.au/results?q=${enc(q)}`,
  },
  iga: {
    id: "iga",
    name: "IGA",
    shortName: "IGA",
    chip: "bg-[#D52026] text-white",
    brand: "#D52026",
    deliveryEta: "Today",
    host: "igashop.com.au",
    searchUrl: (q) => `https://www.igashop.com.au/search?q=${enc(q)}`,
  },
  costco: {
    id: "costco",
    name: "Costco",
    shortName: "Costco",
    chip: "bg-[#005DAA] text-white",
    brand: "#005DAA",
    deliveryEta: "In-store",
    host: "costco.com.au",
    searchUrl: (q) => `https://www.costco.com.au/CatalogSearch?dwfrm_search_search=Search&q=${enc(q)}`,
  },
};

export const STORE_LIST = Object.values(STORES);
