"use client";

import { DashboardLayout } from "@/components/ui";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";

export default function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [policies] = useStore(store.policies);
  const [flags] = useStore(store.flags);

  const pendingPolicies = policies.filter((p) => p.status === "PENDING_REVIEW").length;
  const openFlags = flags.filter((f) => f.resolution_status === "OPEN").length;

  return (
    <DashboardLayout
      tier="CENTRAL"
      allowedRoles={["CENTRAL_ADMIN"]}
      badges={{
        "/central/policy-cards": pendingPolicies,
        "/central/flag-anomaly": openFlags,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
