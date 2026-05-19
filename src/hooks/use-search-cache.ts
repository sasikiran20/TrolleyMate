"use client";

import { useCallback, useEffect, useState } from "react";
import type { SearchResponse } from "@/lib/types";

interface CachedEntry {
  data: SearchResponse;
  ts: number;
}

const CACHE_KEY = "tm.searchCache.v1";
const TTL_MS = 1000 * 60 * 30; // 30 min

function readCache(): Record<string, CachedEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CachedEntry>) : {};
  } catch {
    return {};
  }
}

function writeCache(map: Record<string, CachedEntry>) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function cacheKey(query: string, location: string) {
  return `${location.toLowerCase()}::${query.trim().toLowerCase()}`;
}

export function useSearch(query: string, location: string) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const run = useCallback(async () => {
    setError(null);
    const key = cacheKey(query, location);
    const cache = readCache();
    const hit = cache[key];

    if (hit && Date.now() - hit.ts < TTL_MS) {
      setData({ ...hit.data, cached: true });
      setFromCache(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFromCache(false);
    try {
      const url = `/api/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as SearchResponse;
      setData(json);
      const map = readCache();
      map[key] = { data: json, ts: Date.now() };
      writeCache(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, location]);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, fromCache, refetch: run };
}
