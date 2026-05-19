"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { STORE_LIST } from "@/lib/stores";
import { cn } from "@/lib/utils";
import type { FilterState } from "./filters-sheet";

const PRICE_BANDS: { id: FilterState["priceBand"]; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "lt5", label: "Under $5" },
  { id: "5to10", label: "$5–10" },
  { id: "10to20", label: "$10–20" },
  { id: "gt20", label: "$20+" },
];

const CHANNELS: { id: FilterState["channel"]; label: string }[] = [
  { id: "any", label: "Both" },
  { id: "online", label: "Online" },
  { id: "in-store", label: "In-store" },
];

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onClear: () => void;
}

export function FiltersSidebar({ value, onChange, onClear }: Props) {
  function toggleStore(id: string) {
    onChange({
      ...value,
      stores: value.stores.includes(id)
        ? value.stores.filter((s) => s !== id)
        : [...value.stores, id],
    });
  }

  return (
    <aside className="hidden lg:block sticky top-[170px] self-start w-64 shrink-0">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight">Refine results</h3>
          <button
            onClick={onClear}
            className="text-xs font-medium text-[color:var(--link)] hover:underline"
          >
            Clear all
          </button>
        </div>

        <div className="p-4 space-y-5 text-sm">
          {/* Availability */}
          <section>
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 block">
              Availability
            </Label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox
                checked={value.hideOOS}
                onCheckedChange={(v) => onChange({ ...value, hideOOS: Boolean(v) })}
              />
              <span className="text-sm leading-tight">Hide out of stock</span>
            </label>
          </section>

          <Separator />

          {/* Channel */}
          <section>
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 block">
              Where to buy
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {CHANNELS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChange({ ...value, channel: c.id })}
                  className={cn(
                    "rounded-md py-1.5 text-[11px] font-medium border transition-colors",
                    value.channel === c.id
                      ? "bg-[color:var(--primary)] border-[color:var(--primary-strong)] text-[color:var(--primary-foreground)]"
                      : "border-border bg-card hover:border-foreground/40 text-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Retailers */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Retailers
              </Label>
              <button
                onClick={() => onChange({ ...value, stores: [] })}
                className="text-[10px] text-[color:var(--link)] hover:underline"
              >
                All
              </button>
            </div>
            <div className="space-y-1.5">
              {STORE_LIST.map((s) => {
                const active = value.stores.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors",
                      active ? "bg-[color:var(--primary)]/15" : "hover:bg-muted/60",
                    )}
                  >
                    <Checkbox
                      checked={active}
                      onCheckedChange={() => toggleStore(s.id)}
                    />
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: s.brand }} />
                    <span className="flex-1 leading-tight">{s.name}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Price */}
          <section>
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 block">
              Price range
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_BANDS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange({ ...value, priceBand: p.id })}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors",
                    value.priceBand === p.id
                      ? "bg-[color:var(--primary)] border-[color:var(--primary-strong)] text-[color:var(--primary-foreground)]"
                      : "border-border bg-card hover:border-foreground/40",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Delivery */}
          <section>
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 block">
              Delivery
            </Label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox
                checked={value.fastestFirst}
                onCheckedChange={(v) => onChange({ ...value, fastestFirst: Boolean(v) })}
              />
              <span className="text-sm leading-tight">Fastest available first</span>
            </label>
          </section>
        </div>
      </div>
    </aside>
  );
}
