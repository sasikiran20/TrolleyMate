"use client";

import { ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortKey = "relevance" | "value" | "price-asc" | "price-desc" | "stores";

const OPTIONS: { id: SortKey; label: string }[] = [
  { id: "relevance", label: "Relevance" },
  { id: "value", label: "Best Value" },
  { id: "price-asc", label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
  { id: "stores", label: "Most Retailers" },
];

interface Props {
  value: SortKey;
  onChange: (k: SortKey) => void;
}

export function SortMenu({ value, onChange }: Props) {
  const current = OPTIONS.find((o) => o.id === value)?.label ?? "Sort";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ArrowUpDown className="size-4" />
          Sort
          <span className="hidden sm:inline text-muted-foreground font-normal">· {current}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sort results by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.id}
            onClick={() => onChange(o.id)}
            className={value === o.id ? "text-[color:var(--primary)] font-semibold" : ""}
          >
            <span className="flex-1">{o.label}</span>
            {value === o.id && <Check className="size-4" strokeWidth={3} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
