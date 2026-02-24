import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatNumber(n: number, decimals = 0): string {
  return n.toFixed(decimals).replace(".", ",");
}

export function getCalorieColor(consumed: number, target: number): string {
  const ratio = consumed / target;
  if (ratio < 0.8) return "text-primary-500";
  if (ratio < 1.0) return "text-accent-500";
  return "text-red-500";
}
