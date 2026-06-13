"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV, TIER_ACCENT } from "@/lib/nav";
import type { Tier } from "@/types";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";

interface SidebarProps {
  tier: Tier | "SYSTEM";
  badges?: Record<string, number>;
}

export function Sidebar({ tier, badges }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items = NAV[tier];
  const accent = TIER_ACCENT[tier];
  const dark = tier === "SYSTEM";

  return (
    <aside
      className={cn(
        "no-print flex shrink-0 flex-col border-r transition-all duration-200",
        collapsed ? "w-16" : "w-60",
        dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-4",
          dark ? "text-white" : "text-navy-700"
        )}
      >
        <span className={cn("h-7 w-1.5 rounded-full", accent.bg)} />
        {!collapsed && (
          <span className="text-sm font-bold leading-tight">
            Digital Nepal
            <span className="block text-[10px] font-normal opacity-70">
              Citizen Ecosystem
            </span>
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const count = badges?.[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? accent.active
                  : dark
                  ? "text-slate-300 hover:bg-slate-800"
                  : cn("text-slate-600", accent.hover)
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && count ? (
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", accent.bg, "text-white")}>
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((v) => !v)}
        className={cn(
          "flex items-center justify-center gap-2 border-t px-3 py-3 text-xs",
          dark
            ? "border-slate-700 text-slate-400 hover:bg-slate-800"
            : "border-slate-200 text-slate-400 hover:bg-slate-50"
        )}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : (
          <>
            <ChevronLeft className="h-4 w-4" /> Collapse
          </>
        )}
      </button>
    </aside>
  );
}
