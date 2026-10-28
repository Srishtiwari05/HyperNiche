import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(deadline?: string): string {
  if (!deadline) return "";
  const iso = deadline.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!iso) return deadline;
  const d = new Date(`${iso[1]}T00:00:00`);
  if (Number.isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}
