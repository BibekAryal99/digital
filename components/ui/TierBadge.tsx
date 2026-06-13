import { cn } from "@/lib/utils";
import type { Tier } from "@/types";

const styles: Record<Tier | "SYSTEM", string> = {
  WARD: "bg-ward-light text-ward",
  MUNICIPALITY: "bg-municipality-light text-municipality",
  PROVINCE: "bg-province-light text-province",
  CENTRAL: "bg-central-light text-central",
  SYSTEM: "bg-slate-800 text-white",
};

export function TierBadge({ tier }: { tier: Tier | "SYSTEM" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        styles[tier]
      )}
    >
      {tier}
    </span>
  );
}
