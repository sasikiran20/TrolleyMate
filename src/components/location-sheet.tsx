"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { POPULAR_LOCATIONS, useLocation } from "@/hooks/use-location";
import { MapPin, Navigation, Search } from "lucide-react";

export function LocationSheet({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(location);

  function apply(value: string) {
    setLocation(value);
    setOpen(false);
  }

  function detect() {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      () => apply("Detected location"),
      () => {/* user denied — keep current */},
      { enableHighAccuracy: false, timeout: 4000 },
    );
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(location); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-[color:var(--primary)]" />
            Choose your location
          </SheetTitle>
          <SheetDescription>
            We&apos;ll show online delivery times and in-store stock at your nearest Coles,
            Woolies, ALDI, IGA, Big W, Kmart, Target and Costco.
          </SheetDescription>
        </SheetHeader>

        <div className="px-5 pb-2 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="postcode">Suburb or postcode</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="postcode"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="e.g. 2000 or Bondi NSW"
                  className="pl-9"
                />
              </div>
              <Button onClick={() => apply(draft || location)}>Apply</Button>
            </div>
          </div>

          <button
            type="button"
            onClick={detect}
            className="w-full flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground hover:bg-muted/70 transition-colors"
          >
            <Navigation className="size-4 text-[color:var(--primary)]" />
            <div className="flex flex-col items-start leading-tight">
              <span className="font-medium">Use my current location</span>
              <span className="text-xs text-muted-foreground">We&apos;ll ask your browser for permission.</span>
            </div>
          </button>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Popular cities
            </div>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_LOCATIONS.map((loc) => (
                <button
                  key={loc.label}
                  onClick={() => apply(loc.postcode)}
                  className="text-left rounded-lg border border-border bg-card px-3 py-2.5 hover:border-[color:var(--primary)] hover:bg-muted/40 transition-colors"
                >
                  <div className="text-sm font-medium">{loc.label}</div>
                  <div className="text-[11px] text-muted-foreground">{loc.postcode}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
