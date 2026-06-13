"use client";

import { DashboardLayout } from "@/components/ui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout tier="SYSTEM" allowedRoles={["SYSTEM_ADMIN"]}>
      {children}
    </DashboardLayout>
  );
}
