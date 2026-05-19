"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SavedPage() {
  return (
    <div className="pt-10 text-center max-w-md mx-auto space-y-3 animate-in fade-in duration-300">
      <div className="grid place-items-center mx-auto size-16 rounded-2xl bg-[color:var(--primary)]/15 text-[color:var(--primary)]">
        <Heart className="size-7" />
      </div>
      <h1 className="text-xl font-bold">Your saved items</h1>
      <p className="text-sm text-muted-foreground">
        We&apos;ll watch prices on items you save and ping you when a retailer drops below
        your threshold. Saved items live on your device — nothing leaves your phone.
      </p>
      <Button asChild>
        <Link href="/search">Start comparing</Link>
      </Button>
    </div>
  );
}
