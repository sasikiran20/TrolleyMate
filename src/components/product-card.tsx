"use client";

import { useState } from "react";
import { ExternalLink, Truck, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STORES } from "@/lib/stores";
import { formatAUD, formatUnitPrice } from "@/lib/utils";
import type { Product, StoreOffer } from "@/lib/types";

interface Props {
  product: Product;
  storeFilter?: string[];
  hideOOS?: boolean;
}

export function ProductCard({ product, storeFilter, hideOOS }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  let offers: StoreOffer[] = [...product.offers];
  if (storeFilter && storeFilter.length > 0) {
    offers = offers.filter((o) => storeFilter.includes(o.storeId));
  }
  if (hideOOS) offers = offers.filter((o) => o.inStock);
  offers.sort((a, b) => a.price - b.price);

  if (offers.length === 0) return null;

  const cheapestPrice = offers[0].price;

  return (
    <Card className="product-card overflow-hidden flex flex-col">
      <div className="flex gap-3 p-3 sm:p-4 border-b border-border bg-gradient-to-br from-card to-muted/30">
        <div
          className={`relative grid place-items-center size-20 sm:size-24 shrink-0 rounded-xl bg-gradient-to-br ${product.imageBg} shadow-inner overflow-hidden`}
        >
          {product.imageUrl && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="absolute inset-0 size-full object-contain p-1.5 bg-white"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span aria-hidden className="text-4xl sm:text-5xl">
              {product.imageEmoji}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </div>
          <div className="text-sm sm:text-base font-semibold leading-snug line-clamp-2">
            {product.name}
          </div>
          <div className="mt-auto pt-1 flex items-center gap-1.5 flex-wrap">
            <Badge variant="muted">
              {product.sizeValue}
              {product.sizeUnit}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {product.category}
            </Badge>
            {offers.some((o) => o.isLive) && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--success)]">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--success)] opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[color:var(--success)]" />
                </span>
                Live
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {offers.length} store{offers.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {offers.map((offer, idx) => {
          const store = STORES[offer.storeId];
          const isCheapest = offer.price === cheapestPrice;
          const unit = formatUnitPrice(
            offer.price,
            product.sizeUnit === "kg" ? product.sizeValue * 1000 : product.sizeValue,
            product.sizeUnit === "kg" ? "g" : product.sizeUnit === "L" ? "ml" : product.sizeUnit,
          );

          return (
            <li
              key={`${product.id}-${offer.storeId}-${idx}`}
              className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 transition-colors ${
                isCheapest ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""
              }`}
            >
              <div
                className={`relative grid place-items-center h-7 px-2 rounded-md font-bold text-[11px] shrink-0 ${store.chip}`}
                title={offer.isLive ? `${store.name} — live price` : `${store.name} — typical price`}
              >
                {store.name}
                {offer.isLive && (
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[color:var(--success)] ring-2 ring-card" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground">
                  <Badge
                    variant={offer.channel === "online" ? "online" : "offline"}
                    className="text-[9px] px-1.5 py-0"
                  >
                    {offer.channel === "online" ? (
                      <Truck className="size-2.5" />
                    ) : (
                      <Store className="size-2.5" />
                    )}
                    {offer.channel === "online" ? "Online" : "In-store"}
                  </Badge>
                  {offer.isLive ? (
                    <Badge variant="success" className="text-[9px] px-1.5 py-0">LIVE</Badge>
                  ) : (
                    <Badge variant="muted" className="text-[9px] px-1.5 py-0">typical</Badge>
                  )}
                  <span>{offer.eta}</span>
                  {offer.distanceKm != null && (
                    <span className="text-muted-foreground">· {offer.distanceKm}km</span>
                  )}
                  {!offer.inStock && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                      Out of stock
                    </Badge>
                  )}
                  {offer.promoTag && (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0">
                      {offer.promoTag}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0 min-w-[78px]">
                <div className="flex items-baseline justify-end gap-1.5">
                  {offer.was && (
                    <span className="text-[11px] line-through text-muted-foreground">
                      {formatAUD(offer.was)}
                    </span>
                  )}
                  <span
                    className={`text-base font-bold ${
                      isCheapest ? "text-[color:var(--success)]" : "text-[color:var(--price)]"
                    }`}
                  >
                    {formatAUD(offer.price)}
                  </span>
                </div>
                {unit && (
                  <div className="text-[10px] text-muted-foreground">{unit}</div>
                )}
                {isCheapest && (
                  <Badge variant="cheapest" className="text-[9px] mt-0.5">CHEAPEST</Badge>
                )}
              </div>

              <a
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 grid place-items-center size-8 rounded-md text-muted-foreground hover:text-[color:var(--link)] hover:bg-muted/60 transition-colors"
                aria-label={`Open ${store.name}`}
                title={`Open at ${store.name}`}
              >
                <ExternalLink className="size-4" />
              </a>
            </li>
          );
        })}
      </ul>

      <div className="p-3 sm:p-3.5 border-t border-border flex items-center justify-between gap-2 bg-muted/30">
        <div className="text-[11px] text-muted-foreground leading-tight">
          Save up to{" "}
          <span className="font-bold text-[color:var(--success)] tabular-nums">
            {formatAUD(Math.max(...offers.map((o) => o.price)) - cheapestPrice)}
          </span>{" "}
          on this item
        </div>
        <Button size="sm" variant="amazon" asChild className="text-xs">
          <a href={offers[0].url} target="_blank" rel="noopener noreferrer">
            Buy at {STORES[offers[0].storeId].shortName}
          </a>
        </Button>
      </div>
    </Card>
  );
}
