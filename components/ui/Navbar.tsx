"use client";

import { useAuth } from "@/lib/auth-context";
import { Avatar } from "./Avatar";
import { TierBadge } from "./TierBadge";
import { Button } from "./Button";
import { roleToTier } from "@/lib/utils";
import LogOut from "@mui/icons-material/Logout";

export function Navbar() {
  const { session, logout } = useAuth();
  if (!session) return null;
  const tier = roleToTier(session.role);

  return (
    <header className="no-print flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-navy-700">🇳🇵 Digital Nepal</span>
        </div>
        <span className="hidden text-sm text-slate-400 sm:inline">|</span>
        <span className="hidden text-sm text-slate-500 sm:inline">
          {session.jurisdiction_name}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <TierBadge tier={tier} />
        <div className="flex items-center gap-2">
          <Avatar nameEn={session.full_name} size="sm" />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800">
              {session.full_name}
            </p>
            <p className="text-xs text-slate-400">
              {session.role.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </header>
  );
}
