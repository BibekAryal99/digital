"use client";

import { DashboardLayout } from "@/components/ui";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";

export default function MunicipalityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [approvals] = useStore(store.approvals);
  const [conflicts] = useStore(store.conflicts);

  const pendingApprovals = approvals.filter(
    (a) => a.status === "PENDING" || a.status === "CAO_REVIEW"
  ).length;
  const openConflicts = conflicts.filter(
    (c) => c.resolution_status === "PENDING_REVIEW"
  ).length;

  return (
    <DashboardLayout
      tier="MUNICIPALITY"
      allowedRoles={["LOCAL_BODY_ADMIN"]}
      badges={{
        "/municipality/approvals": pendingApprovals,
        "/municipality/conflicts": openConflicts,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
