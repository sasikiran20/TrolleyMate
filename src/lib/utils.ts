import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAUD(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatUnitPrice(price: number, sizeValue: number, sizeUnit: string) {
  if (!sizeValue || !sizeUnit) return null;
  const per100 = (price / sizeValue) * 100;
  return `${formatAUD(per100)} / 100${sizeUnit}`;
}
