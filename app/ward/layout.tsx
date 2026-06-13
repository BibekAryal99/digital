"use client";

import { DashboardLayout } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";

export default function WardLayout({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [grievances] = useStore(store.grievances);
  const wardId = session?.jurisdiction_id ?? "ward-004";

  const openGrievances = grievances.filter(
    (g) => g.ward_id === wardId && g.status !== "CLOSED" && g.status !== "RESOLVED_WARD"
  ).length;

  return (
    <DashboardLayout
      tier="WARD"
      allowedRoles={["WARD_ADMIN"]}
      badges={{ "/ward/grievances": openGrievances }}
    >
      {children}
    </DashboardLayout>
  );
}
