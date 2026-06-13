"use client";

import { useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { provinces } from "@/lib/data";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  StatCard,
  Table,
  Badge,
} from "@/components/ui";
import { BarList, ColumnChart } from "@/components/charts/BarList";
import type { Column } from "@/components/ui/Table";
import type { Province } from "@/types";
import { humanize } from "@/lib/utils";
import { Users, Building2, ScrollText } from "lucide-react";

export default function CentralAnalyticsPage() {
  const [rules] = useStore(store.rules);

  const nationalPopulation = provinces.reduce((s, p) => s + p.total_citizens, 0);
  const totalMunicipalities = provinces.reduce((s, p) => s + p.municipalities, 0);

  const byProvince = useMemo(
    () => provinces.map((p) => ({ label: p.name, value: p.total_citizens })),
    []
  );

  const topEmployment = useMemo(() => {
    const counts = provinces.reduce<Record<string, number>>((acc, p) => {
      acc[p.top_employment] = (acc[p.top_employment] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([k, v]) => ({ label: humanize(k), value: v }));
  }, []);

  const columns: Column<Province>[] = [
    { key: "name", header: "Province", sortValue: (p) => p.name },
    { key: "total_citizens", header: "Population", align: "right", sortValue: (p) => p.total_citizens, render: (p) => p.total_citizens.toLocaleString("en-IN") },
    { key: "municipalities", header: "Municipalities", align: "right", sortValue: (p) => p.municipalities },
    { key: "top_employment", header: "Top employment", render: (p) => <Badge tone="blue">{humanize(p.top_employment)}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="National Analytics" subtitle="Aggregate indicators across provinces" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="National Population" value={nationalPopulation.toLocaleString("en-IN")} icon={<Users />} accent="central" />
        <StatCard label="Municipalities" value={totalMunicipalities} icon={<Building2 />} accent="central" />
        <StatCard label="Active Rules" value={rules.filter((r) => r.is_active).length} icon={<ScrollText />} accent="central" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Population by province" />
          <CardBody><ColumnChart data={byProvince} color="bg-central" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Dominant employment (provinces)" />
          <CardBody><BarList data={topEmployment} color="bg-central" /></CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Province breakdown" />
        <Table columns={columns} rows={provinces} rowKey={(p) => p.id} />
      </Card>
    </div>
  );
}
