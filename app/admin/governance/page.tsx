"use client";

import { useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { auditLogSeed, provinces } from "@/lib/data";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  StatCard,
  Badge,
} from "@/components/ui";
import { BarList } from "@/components/charts/BarList";
import { humanize } from "@/lib/utils";
import { ShieldCheck, FileLock2, Activity, Users } from "lucide-react";

export default function GovernancePage() {
  const [citizens] = useStore(store.citizens);
  const [config] = useStore(store.config);

  const consentCompliance = useMemo(() => {
    const withConsent = citizens.filter((c) => c.consent_recorded_at).length;
    return Math.round((withConsent / Math.max(1, citizens.length)) * 100);
  }, [citizens]);

  const nidVerified = useMemo(() => {
    const v = citizens.filter((c) => c.nid_verified).length;
    return Math.round((v / Math.max(1, citizens.length)) * 100);
  }, [citizens]);

  const auditByType = useMemo(
    () =>
      Object.entries(
        auditLogSeed.reduce<Record<string, number>>((acc, e) => {
          acc[e.event_type] = (acc[e.event_type] ?? 0) + 1;
          return acc;
        }, {})
      )
        .map(([k, v]) => ({ label: humanize(k), value: v }))
        .sort((a, b) => b.value - a.value),
    []
  );

  const principles = [
    { title: "Data Minimisation", desc: "Only data required for service delivery is collected.", ok: true },
    { title: "Consent Tracking", desc: `${consentCompliance}% of records have recorded consent.`, ok: consentCompliance >= 90 },
    { title: "Right to Rectification", desc: "Citizens can request edits via grievance & approval flow.", ok: true },
    { title: "Audit Immutability", desc: `${auditLogSeed.length} append-only audit events retained.`, ok: true },
    { title: "Access Control", desc: "Role-based access enforced across all 5 tiers.", ok: true },
    { title: "Retention Policy", desc: `Sync data purged after ${config.sync_cleanup_days} days.`, ok: true },
  ];

  return (
    <div>
      <PageHeader title="Digital Governance Board" subtitle="National data governance oversight" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Consent Compliance" value={`${consentCompliance}%`} icon={<FileLock2 />} accent="navy" />
        <StatCard label="NID Verification" value={`${nidVerified}%`} icon={<ShieldCheck />} accent="navy" />
        <StatCard label="Audit Events" value={auditLogSeed.length} icon={<Activity />} accent="navy" />
        <StatCard label="Provinces Covered" value={provinces.length} icon={<Users />} accent="navy" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Governance principles" />
          <CardBody className="space-y-3">
            {principles.map((p) => (
              <div key={p.title} className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>
                <Badge tone={p.ok ? "green" : "amber"}>{p.ok ? "Compliant" : "Review"}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Audit activity by type" />
          <CardBody><BarList data={auditByType} color="bg-slate-700" /></CardBody>
        </Card>
      </div>
    </div>
  );
}
