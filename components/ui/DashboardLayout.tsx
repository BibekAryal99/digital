"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Spinner } from "./Spinner";
import { homePathForRole } from "@/lib/utils";
import type { Role, Tier } from "@/types";

interface DashboardLayoutProps {
  tier: Tier | "SYSTEM";
  allowedRoles: Role[];
  badges?: Record<string, number>;
  children: React.ReactNode;
}

export function DashboardLayout({
  tier,
  allowedRoles,
  badges,
  children,
}: DashboardLayoutProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(session.role)) {
      router.replace("/unauthorized");
    }
  }, [session, isLoading, allowedRoles, router]);

  if (isLoading || !session) {
    return (
      <div className="flex h-screen items-center justify-center text-navy-700">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!allowedRoles.includes(session.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-slate-500">
        <Spinner />
        <p>Redirecting…</p>
        <button
          className="text-sm text-navy-700 underline"
          onClick={() => router.replace(homePathForRole(session.role))}
        >
          Go to my dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar tier={tier} badges={badges} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto scroll-thin bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
