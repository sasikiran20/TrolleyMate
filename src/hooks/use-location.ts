"use client";

import { useLocalStorage } from "./use-local-storage";

export const DEFAULT_LOCATION = "Sydney NSW 2000";

export const POPULAR_LOCATIONS = [
  { label: "Sydney CBD", postcode: "Sydney NSW 2000" },
  { label: "Melbourne CBD", postcode: "Melbourne VIC 3000" },
  { label: "Brisbane CBD", postcode: "Brisbane QLD 4000" },
  { label: "Perth CBD", postcode: "Perth WA 6000" },
  { label: "Adelaide CBD", postcode: "Adelaide SA 5000" },
  { label: "Canberra", postcode: "Canberra ACT 2600" },
  { label: "Hobart", postcode: "Hobart TAS 7000" },
  { label: "Darwin", postcode: "Darwin NT 0800" },
];

export function useLocation() {
  return useLocalStorage<string>("tm.location.v1", DEFAULT_LOCATION);
}
