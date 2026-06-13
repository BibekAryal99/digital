import type { Tier, Role } from "@/types";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ageFromDob(dob: string): number {
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function daysSince(value: string): number {
  const d = new Date(value);
  return Math.floor((Date.now() - d.getTime()) / (24 * 3600 * 1000));
}

export function daysUntil(value: string): number {
  const d = new Date(value);
  return Math.floor((d.getTime() - Date.now()) / (24 * 3600 * 1000));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function npInitials(nameNp: string): string {
  // first two devanagari "letters" cluster — approximate by first 2 chars
  return Array.from(nameNp.replace(/\s/g, "")).slice(0, 2).join("");
}

export function formatNpr(amount: number): string {
  return "NPR " + amount.toLocaleString("en-IN");
}

export function humanize(value?: string): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const TIER_LABEL: Record<Tier, string> = {
  WARD: "Ward",
  MUNICIPALITY: "Municipality",
  PROVINCE: "Province",
  CENTRAL: "Central",
};

export function roleToTier(role: Role): Tier | "SYSTEM" {
  switch (role) {
    case "WARD_ADMIN":
      return "WARD";
    case "LOCAL_BODY_ADMIN":
      return "MUNICIPALITY";
    case "PROVINCE_ADMIN":
      return "PROVINCE";
    case "CENTRAL_ADMIN":
      return "CENTRAL";
    default:
      return "SYSTEM";
  }
}

export function homePathForRole(role: Role): string {
  switch (role) {
    case "WARD_ADMIN":
      return "/ward/dashboard";
    case "LOCAL_BODY_ADMIN":
      return "/municipality/dashboard";
    case "PROVINCE_ADMIN":
      return "/province/dashboard";
    case "CENTRAL_ADMIN":
      return "/central/dashboard";
    case "SYSTEM_ADMIN":
      return "/admin/accounts";
    default:
      return "/login";
  }
}

export function generateTrackingCode(): string {
  const n = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `GRV-2026-${n}`;
}

export function generateTempPassword(): string {
  return "Tmp" + Math.random().toString(36).slice(2, 8) + "!";
}
