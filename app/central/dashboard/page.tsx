"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { provinces } from "@/lib/data";
import {
  StatCard,
  Card,
  CardHeader,
  CardBody,
  Badge,
  PageHeader,
} from "@/components/ui";
import { BarList } from "@/components/charts/BarList";
import Globe2 from "@mui/icons-material/Public";
import Users from "@mui/icons-material/People";
import Building2 from "@mui/icons-material/Apartment";
import ScrollText from "@mui/icons-material/Description";
import { humanize } from "@/lib/utils";

export default function CentralDashboard() {
  const [rules] = useStore(store.rules);
  const [policies] = useStore(store.policies);

  const nationalPopulation = provinces.reduce((s, p) => s + p.total_citizens, 0);
  const totalMunicipalities = provinces.reduce((s, p) => s + p.municipalities, 0);
  const activeRules = rules.filter((r) => r.is_active).length;

  const byProvince = useMemo(
    () =>
      provinces
        .map((p) => ({ label: p.name, value: p.total_citizens }))
        .sort((a, b) => b.value - a.value),
    []
  );

  return (
    <div>
      <PageHeader title="Central Dashboard" subtitle="Government of Nepal — National Overview" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="National Population" value={nationalPopulation.toLocaleString("en-IN")} icon={<Users />} accent="central" />
        <StatCard label="Provinces" value={provinces.length} icon={<Globe2 />} accent="central" />
        <StatCard label="Municipalities" value={totalMunicipalities} icon={<Building2 />} accent="central" />
        <StatCard label="Active Eligibility Rules" value={activeRules} icon={<ScrollText />} accent="central" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Population by province"
            action={
              <Link href="/central/national-map" className="text-sm text-navy-700 hover:underline">
                View map
              </Link>
            }
          />
          <CardBody>
            <BarList data={byProvince} color="bg-central" valueFormatter={(v) => v.toLocaleString("en-IN")} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Policy cards"
            action={
              <Link href="/central/policy-cards" className="text-sm text-navy-700 hover:underline">
                View all
              </Link>
            }
          />
          <CardBody className="space-y-2">
            {policies.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href="/central/policy-cards"
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.province} · {humanize(p.category)}</p>
                </div>
                <Badge status={p.status} />
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
