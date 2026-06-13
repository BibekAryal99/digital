import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  change?: { value: string; positive?: boolean };
  accent?: "ward" | "municipality" | "province" | "central" | "navy";
}

export function StatCard({ label, value, icon, change, accent = "navy" }: StatCardProps) {
  return (
    <Card accent={accent} className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                change.positive ? "text-green-600" : "text-red-600"
              )}
            >
              {change.value}
            </p>
          )}
        </div>
        {icon && <div className="text-2xl text-slate-300">{icon}</div>}
      </div>
    </Card>
  );
}
