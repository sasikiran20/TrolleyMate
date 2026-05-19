"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, X } from "lucide-react";

const KEY = "tm.recentSearches.v1";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

function write(list: string[]) {
  try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

export function pushRecent(query: string) {
  const t = query.trim();
  if (!t) return;
  const list = read();
  const next = [t, ...list.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8);
  write(next);
}

export function RecentSearches() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(read());
    const onStorage = () => setItems(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function remove(q: string) {
    const next = read().filter((x) => x !== q);
    write(next);
    setItems(next);
  }

  if (items.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold inline-flex items-center gap-1.5">
          <Clock className="size-4 text-muted-foreground" /> Your recent searches
        </h2>
        <button
          onClick={() => { write([]); setItems([]); }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {items.map((q) => (
          <div
            key={q}
            className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border pl-3 pr-1 py-1 text-xs font-medium hover:border-foreground/40 transition-colors"
          >
            <Link href={`/search?q=${encodeURIComponent(q)}`}>{q}</Link>
            <button
              onClick={() => remove(q)}
              className="grid place-items-center size-5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={`Remove ${q}`}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
