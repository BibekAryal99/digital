"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wards } from "@/lib/data";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  StatCard,
} from "@/components/ui";
import { BarList, ColumnChart } from "@/components/charts/BarList";
import { humanize } from "@/lib/utils";
import Accessibility from "@mui/icons-material/Accessible";
import Plane from "@mui/icons-material/Flight";
import GraduationCap from "@mui/icons-material/School";

export default function ProvinceAnalyticsPage() {
  const { session } = useAuth();
  const provId = session?.jurisdiction_id ?? "prov-koshi";
  const [citizens] = useStore(store.citizens);

  const provCitizens = useMemo(() => {
    const wardIds = new Set(wards.filter((w) => w.province_id === provId).map((w) => w.id));
    return citizens.filter((c) => wardIds.has(c.ward_id));
  }, [citizens, provId]);

  const employment = useMemo(
    () =>
      Object.entries(
        provCitizens.reduce<Record<string, number>>((acc, c) => {
          acc[c.employment_category] = (acc[c.employment_category] ?? 0) + 1;
          return acc;
        }, {})
      )
        .map(([k, v]) => ({ label: humanize(k), value: v }))
        .sort((a, b) => b.value - a.value),
    [provCitizens]
  );

  const withDisability = provCitizens.filter((c) => c.disability);
  const disabilityByType = useMemo(
    () =>
      Object.entries(
        withDisability.reduce<Record<string, number>>((acc, c) => {
          const t = c.disability!.disability_type;
          acc[t] = (acc[t] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([k, v]) => ({ label: humanize(k), value: v })),
    [withDisability]
  );

  const disabilityBySeverity = useMemo(() => {
    const buckets = [0, 1, 2, 3, 4].map((s) => ({ label: `Sev ${s}`, value: 0 }));
    withDisability.forEach((c) => {
      const d = c.disability!;
      const max = Math.max(d.severity_body, d.severity_activity, d.severity_participation);
      buckets[max].value += 1;
    });
    return buckets;
  }, [withDisability]);

  const abroad = provCitizens.filter((c) => c.employment_category === "FOREIGN_ABROAD").length;
  const students = provCitizens.filter((c) => c.employment_category === "STUDENT").length;

  const income = useMemo(
    () =>
      Object.entries(
        provCitizens.reduce<Record<string, number>>((acc, c) => {
          const b = c.income_band ?? "UNKNOWN";
          acc[b] = (acc[b] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([k, v]) => ({ label: humanize(k), value: v })),
    [provCitizens]
  );

  return (
    <div>
      <PageHeader title="Analytics" subtitle={session?.jurisdiction_name ?? "Koshi Province"} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Persons with Disability" value={withDisability.length} icon={<Accessibility />} accent="province" />
        <StatCard label="Foreign Employment" value={abroad} icon={<Plane />} accent="province" />
        <StatCard label="Students" value={students} icon={<GraduationCap />} accent="province" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Employment distribution" />
          <CardBody><BarList data={employment} color="bg-province" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Income bands" />
          <CardBody><BarList data={income} color="bg-province" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Disability by type" />
          <CardBody>
            {disabilityByType.length ? (
              <BarList data={disabilityByType} color="bg-province" />
            ) : (
              <p className="text-sm text-slate-400">No disability records.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Disability by WHO ICF severity" />
          <CardBody>
            <ColumnChart data={disabilityBySeverity} color="bg-province" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
