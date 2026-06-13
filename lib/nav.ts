import type { Tier } from "@/types";
import {
  LayoutDashboard,
  Users,
  IdCard,
  MessageSquareWarning,
  RefreshCw,
  CheckSquare,
  GitMerge,
  HandCoins,
  UserCog,
  FileBarChart,
  Building2,
  BarChart3,
  Map,
  ScrollText,
  ClipboardList,
  Flag,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV: Record<Tier | "SYSTEM", NavItem[]> = {
  WARD: [
    { label: "Dashboard", href: "/ward/dashboard", icon: LayoutDashboard },
    { label: "Citizens", href: "/ward/citizens", icon: Users },
    { label: "ID Cards", href: "/ward/id-cards", icon: IdCard },
    { label: "Grievances", href: "/ward/grievances", icon: MessageSquareWarning },
    { label: "Sync Status", href: "/ward/sync", icon: RefreshCw },
  ],
  MUNICIPALITY: [
    { label: "Dashboard", href: "/municipality/dashboard", icon: LayoutDashboard },
    { label: "Approvals", href: "/municipality/approvals", icon: CheckSquare },
    { label: "Conflicts", href: "/municipality/conflicts", icon: GitMerge },
    { label: "Benefits", href: "/municipality/benefits", icon: HandCoins },
    { label: "Ward Admins", href: "/municipality/ward-admins", icon: UserCog },
    { label: "Reports", href: "/municipality/reports", icon: FileBarChart },
  ],
  PROVINCE: [
    { label: "Dashboard", href: "/province/dashboard", icon: LayoutDashboard },
    { label: "Municipalities", href: "/province/municipalities", icon: Building2 },
    { label: "Analytics", href: "/province/analytics", icon: BarChart3 },
    { label: "Reports", href: "/province/reports", icon: FileBarChart },
  ],
  CENTRAL: [
    { label: "Dashboard", href: "/central/dashboard", icon: LayoutDashboard },
    { label: "National Map", href: "/central/national-map", icon: Map },
    { label: "Eligibility Rules", href: "/central/eligibility-rules", icon: ScrollText },
    { label: "Audit Log", href: "/central/audit-log", icon: ClipboardList },
    { label: "Policy Cards", href: "/central/policy-cards", icon: FileBarChart },
    { label: "Flag Anomaly", href: "/central/flag-anomaly", icon: Flag },
    { label: "Analytics", href: "/central/analytics", icon: BarChart3 },
    { label: "Province Admins", href: "/central/province-admins", icon: ShieldCheck },
  ],
  SYSTEM: [
    { label: "Accounts", href: "/admin/accounts", icon: Users },
    { label: "System Config", href: "/admin/system-config", icon: Settings },
    { label: "Governance Board", href: "/admin/governance", icon: ShieldCheck },
  ],
};

export const TIER_ACCENT: Record<Tier | "SYSTEM", {
  bg: string;
  text: string;
  active: string;
  hover: string;
}> = {
  WARD: { bg: "bg-ward", text: "text-ward", active: "bg-ward-light text-ward", hover: "hover:bg-green-50" },
  MUNICIPALITY: { bg: "bg-municipality", text: "text-municipality", active: "bg-municipality-light text-municipality", hover: "hover:bg-orange-50" },
  PROVINCE: { bg: "bg-province", text: "text-province", active: "bg-province-light text-province", hover: "hover:bg-blue-50" },
  CENTRAL: { bg: "bg-central", text: "text-central", active: "bg-central-light text-central", hover: "hover:bg-red-50" },
  SYSTEM: { bg: "bg-slate-800", text: "text-slate-200", active: "bg-slate-700 text-white", hover: "hover:bg-slate-700/60" },
};
