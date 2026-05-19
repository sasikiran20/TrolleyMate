"use client";

import { useLocation, POPULAR_LOCATIONS } from "@/hooks/use-location";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";

export default function LocationPage() {
  const [location, setLocation] = useLocation();
  const [draft, setDraft] = useState(location);

  function detect() {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      () => setLocation("Detected location"),
      () => {},
    );
  }

  return (
    <div className="pt-4 sm:pt-6 space-y-4 max-w-xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <div className="grid place-items-center size-10 rounded-xl bg-[color:var(--primary)]/15 text-[color:var(--primary)]">
          <MapPin className="size-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">Delivery location</h1>
          <p className="text-sm text-muted-foreground">Used to estimate stock & ETAs at nearby stores.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loc">Suburb or postcode</Label>
            <div className="flex gap-2">
              <Input id="loc" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. Bondi NSW 2026" />
              <Button onClick={() => setLocation(draft)}>Save</Button>
            </div>
            <p className="text-xs text-muted-foreground">Current: <span className="text-foreground font-medium">{location}</span></p>
          </div>

          <button
            onClick={detect}
            className="w-full flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm hover:bg-muted/70 transition-colors"
          >
            <Navigation className="size-4 text-[color:var(--primary)]" />
            Detect from device GPS
          </button>
        </CardContent>
      </Card>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Popular</div>
        <div className="grid grid-cols-2 gap-2">
          {POPULAR_LOCATIONS.map((l) => (
            <button
              key={l.label}
              onClick={() => { setLocation(l.postcode); setDraft(l.postcode); }}
              className="text-left rounded-lg border border-border bg-card px-3 py-2.5 hover:border-[color:var(--primary)] hover:bg-muted/40 transition-colors"
            >
              <div className="text-sm font-medium">{l.label}</div>
              <div className="text-[11px] text-muted-foreground">{l.postcode}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
