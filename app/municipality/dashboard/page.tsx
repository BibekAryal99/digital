"use client";

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
  Badge,
  PageHeader,
} from "@/components/ui";
import { BarList } from "@/components/charts/BarList";
import { Users, CheckSquare, GitMerge, IdCard } from "lucide-react";
import { humanize } from "@/lib/utils";

export default function MunicipalityDashboard() {
  const { session } = useAuth();
  const munId = session?.jurisdiction_id ?? "mun-001";
  const [citizens] = useStore(store.citizens);
  const [approvals] = useStore(store.approvals);
  const [conflicts] = useStore(store.conflicts);
  const [idcards] = useStore(store.idcards);

  const munWards = wards.filter((w) => w.municipality_id === munId);
  const wardIds = new Set(munWards.map((w) => w.id));
  const munCitizens = citizens.filter((c) => wardIds.has(c.ward_id));

  const pendingApprovals = approvals.filter((a) => a.status === "PENDING").length;
  const openConflicts = conflicts.filter((c) => c.resolution_status === "PENDING_REVIEW").length;
  const cardsIssued = idcards.filter(
    (c) => wardIds.has(c.ward_id) && (c.status === "APPROVED" || c.status === "COLLECTED")
  ).length;

  const byWard = munWards
    .map((w) => ({
      label: `Ward ${w.ward_no}`,
      value: munCitizens.filter((c) => c.ward_id === w.id).length,
    }))
    .sort((a, b) => b.value - a.value);

  const empCounts = munCitizens.reduce<Record<string, number>>((acc, c) => {
    acc[c.employment_category] = (acc[c.employment_category] ?? 0) + 1;
    return acc;
  }, {});
  const byEmployment = Object.entries(empCounts)
    .map(([k, v]) => ({ label: humanize(k), value: v }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <PageHeader
        title="Municipality Dashboard"
        subtitle={session?.jurisdiction_name ?? "Kummayak Rural Municipality"}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Citizens" value={munCitizens.length} icon={<Users />} accent="municipality" />
        <StatCard label="Pending Approvals" value={pendingApprovals} icon={<CheckSquare />} accent="municipality" />
        <StatCard label="Open Conflicts" value={openConflicts} icon={<GitMerge />} accent="municipality" />
        <StatCard label="ID Cards Issued" value={cardsIssued} icon={<IdCard />} accent="municipality" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Citizens by ward" subtitle={`${munWards.length} wards`} />
          <CardBody>
            <BarList data={byWard} color="bg-municipality" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Employment distribution" />
          <CardBody>
            <BarList data={byEmployment} color="bg-municipality" />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Latest approval requests"
          action={
            <Link href="/municipality/approvals" className="text-sm text-navy-700 hover:underline">
              View queue
            </Link>
          }
        />
        <CardBody className="space-y-2">
          {approvals.slice(0, 5).map((a) => (
            <Link
              key={a.id}
              href="/municipality/approvals"
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">{a.citizen_name}</p>
                <p className="text-xs text-slate-400">{a.reason}</p>
              </div>
              <Badge status={a.status} />
            </Link>
          ))}
          {approvals.length === 0 && (
            <p className="text-sm text-slate-400">No approval requests.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
