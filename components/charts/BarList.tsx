import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
}

interface BarListProps {
  data: BarDatum[];
  color?: string; // tailwind bg class
  valueFormatter?: (v: number) => string;
}

export function BarList({
  data,
  color = "bg-navy-700",
  valueFormatter,
}: BarListProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-sm text-slate-600">
            {d.label}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
            <div
              className={cn("h-full rounded", color)}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-16 shrink-0 text-right text-sm font-medium text-slate-700">
            {valueFormatter ? valueFormatter(d.value) : d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface ColumnChartProps {
  data: BarDatum[];
  color?: string;
}

export function ColumnChart({ data, color = "bg-navy-700" }: ColumnChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-48 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium text-slate-500">{d.value}</span>
          <div
            className={cn("w-full rounded-t", color)}
            style={{ height: `${(d.value / max) * 100}%`, minHeight: "4px" }}
          />
          <span className="truncate text-xs text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
