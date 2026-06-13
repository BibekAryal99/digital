import { cn } from "@/lib/utils";
import { humanize } from "@/lib/utils";

export type Tone =
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "gray"
  | "teal"
  | "purple"
  | "orange"
  | "pink";

const tones: Record<Tone, string> = {
  green: "bg-green-100 text-green-800 ring-green-600/20",
  amber: "bg-amber-100 text-amber-800 ring-amber-600/20",
  red: "bg-red-100 text-red-800 ring-red-600/20",
  blue: "bg-blue-100 text-blue-800 ring-blue-600/20",
  gray: "bg-slate-100 text-slate-700 ring-slate-500/20",
  teal: "bg-teal-100 text-teal-800 ring-teal-600/20",
  purple: "bg-purple-100 text-purple-800 ring-purple-600/20",
  orange: "bg-orange-100 text-orange-800 ring-orange-600/20",
  pink: "bg-pink-100 text-pink-800 ring-pink-600/20",
};

// Maps all known system statuses to a tone (per the project spec).
const STATUS_TONE: Record<string, Tone> = {
  // sync
  synced: "green",
  SYNCED: "green",
  pending: "amber",
  PENDING: "amber",
  conflict: "red",
  CONFLICT: "red",
  failed: "red",
  VERIFIED: "blue",
  ARCHIVED: "gray",
  // id-card
  INITIATED: "gray",
  PENDING_APPROVAL: "amber",
  PDF_GENERATION: "blue",
  QR_SIGNED: "blue",
  SMS_PENDING: "amber",
  APPROVED: "green",
  COLLECTED: "teal",
  EXPIRED: "gray",
  REVOKED: "red",
  // grievance
  RECEIVED: "blue",
  IN_PROGRESS: "amber",
  RESOLVED_WARD: "green",
  REFERRED_JUDICIAL: "orange",
  CLOSED: "gray",
  // approvals
  REJECTED: "red",
  CAO_REVIEW: "purple",
  // conflict resolution
  PENDING_REVIEW: "amber",
  MERGED: "green",
  OVERWRITTEN: "blue",
  // policy
  ACKNOWLEDGED: "blue",
  COMPLETED: "green",
  DISMISSED: "gray",
  // benefit types
  UNEMPLOYMENT_ID: "amber",
  DISABILITY_ID: "blue",
  SENIOR_CITIZEN: "green",
  SINGLE_WOMAN: "pink",
  FOOD_SUBSIDY: "orange",
  HEALTH_INSURANCE: "teal",
  // audit
  REGISTERED: "green",
  UPDATED: "blue",
  CONFLICT_RESOLVED: "orange",
  ID_CARD_ISSUED: "purple",
  DATA_PURGED: "gray",
  PASSWORD_RESET: "amber",
  // sync health
  HEALTHY: "green",
  STALE: "amber",
  CRITICAL: "red",
};

export function statusTone(status: string): Tone {
  return STATUS_TONE[status] ?? "gray";
}

interface BadgeProps {
  children?: React.ReactNode;
  tone?: Tone;
  status?: string;
  className?: string;
}

export function Badge({ children, tone, status, className }: BadgeProps) {
  const finalTone = tone ?? (status ? statusTone(status) : "gray");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        tones[finalTone],
        className
      )}
    >
      {children ?? (status ? humanize(status) : "")}
    </span>
  );
}
