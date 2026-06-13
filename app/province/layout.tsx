"use client";

import { DashboardLayout } from "@/components/ui";

export default function ProvinceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout tier="PROVINCE" allowedRoles={["PROVINCE_ADMIN"]}>
      {children}
    </DashboardLayout>
  );
}
