"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { STORE_LIST } from "@/lib/stores";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  hideOOS: boolean;
  stores: string[];
  priceBand: "any" | "lt5" | "5to10" | "10to20" | "gt20";
  channel: "any" | "online" | "in-store";
  fastestFirst: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  hideOOS: true,
  stores: [],
  priceBand: "any",
  channel: "any",
  fastestFirst: false,
};

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  activeCount: number;
}

const PRICE_BANDS: { id: FilterState["priceBand"]; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "lt5", label: "Under $5" },
  { id: "5to10", label: "$5 – $10" },
  { id: "10to20", label: "$10 – $20" },
  { id: "gt20", label: "$20+" },
];

const CHANNELS: { id: FilterState["channel"]; label: string }[] = [
  { id: "any", label: "Online + In-store" },
  { id: "online", label: "Online only" },
  { id: "in-store", label: "In-store only" },
];

export function FiltersSheet({ value, onChange, activeCount }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(value);

  function apply() {
    onChange(draft);
    setOpen(false);
  }
  function clear() {
    setDraft(DEFAULT_FILTERS);
  }

  function toggleStore(id: string) {
    setDraft((d) => ({
      ...d,
      stores: d.stores.includes(id)
        ? d.stores.filter((s) => s !== id)
        : [...d.stores, id],
    }));
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(value); }}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 inline-grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-[color:var(--primary)] text-[color:var(--primary-foreground)] text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle>Filters</SheetTitle>
          <button onClick={clear} className="text-xs font-medium text-[color:var(--link)] hover:underline">
            Clear all
          </button>
        </SheetHeader>

        <div className="px-5 space-y-6">
          {/* Availability */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Availability</h3>
            <label
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-card p-3 cursor-pointer transition-colors",
                draft.hideOOS ? "border-[color:var(--primary)] bg-[color:var(--primary)]/5" : "border-border hover:border-muted-foreground/40",
              )}
            >
              <Checkbox
                checked={draft.hideOOS}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, hideOOS: Boolean(v) }))}
              />
              <div className="leading-tight">
                <div className="text-sm font-medium">Hide out of stock</div>
                <div className="text-xs text-muted-foreground">Show only retailers that still have stock.</div>
              </div>
            </label>
          </section>

          <Separator />

          {/* Channel */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Where to buy</h3>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, channel: c.id }))}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                    draft.channel === c.id
                      ? "bg-[color:var(--primary)] border-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                      : "border-border bg-card hover:border-muted-foreground/40",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Stores */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Retailers</h3>
              <button
                onClick={() => setDraft((d) => ({ ...d, stores: [] }))}
                className="text-[11px] text-[color:var(--link)] hover:underline"
              >
                All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {STORE_LIST.map((s) => {
                const active = draft.stores.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleStore(s.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors flex items-center gap-1.5",
                      active
                        ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10 text-foreground"
                        : "border-border bg-card hover:border-muted-foreground/40",
                    )}
                  >
                    <span className={cn("size-2.5 rounded-full")} style={{ backgroundColor: s.brand }} />
                    {s.name}
                  </button>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Price */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Price range</h3>
            <div className="flex flex-wrap gap-2">
              {PRICE_BANDS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, priceBand: p.id }))}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                    draft.priceBand === p.id
                      ? "bg-[color:var(--primary)] border-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                      : "border-border bg-card hover:border-muted-foreground/40",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Delivery */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Delivery</h3>
            <label
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-card p-3 cursor-pointer transition-colors",
                draft.fastestFirst ? "border-[color:var(--primary)] bg-[color:var(--primary)]/5" : "border-border hover:border-muted-foreground/40",
              )}
            >
              <Checkbox
                checked={draft.fastestFirst}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, fastestFirst: Boolean(v) }))}
              />
              <div className="leading-tight">
                <Label className="text-sm font-medium">Fastest available first</Label>
                <div className="text-xs text-muted-foreground">Prioritise products available on the quickest retailers.</div>
              </div>
            </label>
          </section>
        </div>

        <SheetFooter className="grid grid-cols-2 gap-2">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={apply} variant="amazon">Done</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
