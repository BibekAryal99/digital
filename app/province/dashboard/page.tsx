"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wards } from "@/lib/data";
import {
  StatCard,
  Card,
  CardHeader,
  CardBody,
  PageHeader,
} from "@/components/ui";
import { BarList } from "@/components/charts/BarList";
import Building2 from "@mui/icons-material/Apartment";
import Users from "@mui/icons-material/People";
import MessageSquareWarning from "@mui/icons-material/ReportProblem";
import IdCard from "@mui/icons-material/Badge";
import { humanize } from "@/lib/utils";

export default function ProvinceDashboard() {
  const { session } = useAuth();
  const provId = session?.jurisdiction_id ?? "prov-koshi";
  const [citizens] = useStore(store.citizens);
  const [grievances] = useStore(store.grievances);
  const [idcards] = useStore(store.idcards);

  const provWards = useMemo(() => wards.filter((w) => w.province_id === provId), [provId]);
  const wardIds = useMemo(() => new Set(provWards.map((w) => w.id)), [provWards]);
  const provCitizens = useMemo(() => citizens.filter((c) => wardIds.has(c.ward_id)), [citizens, wardIds]);

  const municipalities = useMemo(() => {
    const map = new Map<string, string>();
    provWards.forEach((w) => map.set(w.municipality_id, w.municipality_name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [provWards]);

  const byMunicipality = municipalities.map((m) => {
    const mWardIds = new Set(provWards.filter((w) => w.municipality_id === m.id).map((w) => w.id));
    return { label: m.name.replace(" Rural Municipality", ""), value: provCitizens.filter((c) => mWardIds.has(c.ward_id)).length };
  });

  const employment = Object.entries(
    provCitizens.reduce<Record<string, number>>((acc, c) => {
      acc[c.employment_category] = (acc[c.employment_category] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([k, v]) => ({ label: humanize(k), value: v }))
    .sort((a, b) => b.value - a.value);

  const openGrievances = grievances.filter(
    (g) => wardIds.has(g.ward_id) && g.status !== "CLOSED" && g.status !== "RESOLVED_WARD"
  ).length;
  const cardsIssued = idcards.filter(
    (c) => wardIds.has(c.ward_id) && (c.status === "APPROVED" || c.status === "COLLECTED")
  ).length;

  return (
    <div>
      <PageHeader
        title="Province Dashboard"
        subtitle={session?.jurisdiction_name ?? "Koshi Province"}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Municipalities" value={municipalities.length} icon={<Building2 />} accent="province" />
        <StatCard label="Total Citizens" value={provCitizens.length} icon={<Users />} accent="province" />
        <StatCard label="Open Grievances" value={openGrievances} icon={<MessageSquareWarning />} accent="province" />
        <StatCard label="ID Cards Issued" value={cardsIssued} icon={<IdCard />} accent="province" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Citizens by municipality"
            action={
              <Link href="/province/municipalities" className="text-sm text-navy-700 hover:underline">
                Compare
              </Link>
            }
          />
          <CardBody><BarList data={byMunicipality} color="bg-province" /></CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Employment across province"
            action={
              <Link href="/province/analytics" className="text-sm text-navy-700 hover:underline">
                Analytics
              </Link>
            }
          />
          <CardBody><BarList data={employment} color="bg-province" /></CardBody>
        </Card>
      </div>
    </div>
  );
}
