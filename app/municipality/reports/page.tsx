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
  Button,
} from "@/components/ui";
import { BarList } from "@/components/charts/BarList";
import { downloadCsv } from "@/lib/csv";
import { humanize } from "@/lib/utils";
import Download from "@mui/icons-material/Download";
import Printer from "@mui/icons-material/Print";

export default function ReportsPage() {
  const { session } = useAuth();
  const munId = session?.jurisdiction_id ?? "mun-001";
  const [citizens] = useStore(store.citizens);
  const [grievances] = useStore(store.grievances);
  const [idcards] = useStore(store.idcards);

  const munWards = useMemo(() => wards.filter((w) => w.municipality_id === munId), [munId]);
  const wardIds = useMemo(() => new Set(munWards.map((w) => w.id)), [munWards]);
  const munCitizens = useMemo(() => citizens.filter((c) => wardIds.has(c.ward_id)), [citizens, wardIds]);

  const byWard = munWards.map((w) => ({
    label: `Ward ${w.ward_no}`,
    value: munCitizens.filter((c) => c.ward_id === w.id).length,
  }));

  const employment = Object.entries(
    munCitizens.reduce<Record<string, number>>((acc, c) => {
      acc[c.employment_category] = (acc[c.employment_category] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([k, v]) => ({ label: humanize(k), value: v }));

  const grievanceByStatus = Object.entries(
    grievances
      .filter((g) => wardIds.has(g.ward_id))
      .reduce<Record<string, number>>((acc, g) => {
        acc[g.status] = (acc[g.status] ?? 0) + 1;
        return acc;
      }, {})
  ).map(([k, v]) => ({ label: humanize(k), value: v }));

  function exportCensus() {
    downloadCsv(
      "kummayak-census.csv",
      munCitizens.map((c) => ({
        id: c.id,
        name: c.name_en,
        ward: c.ward_id,
        sex: c.sex,
        employment: c.employment_category,
        income_band: c.income_band ?? "",
        nid_verified: c.nid_verified,
      }))
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={session?.jurisdiction_name ?? "Kummayak Rural Municipality"}
        action={
          <div className="flex gap-2 no-print">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button onClick={exportCensus}>
              <Download className="h-4 w-4" /> Export Census CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Population by ward" />
          <CardBody><BarList data={byWard} color="bg-municipality" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Employment composition" />
          <CardBody><BarList data={employment} color="bg-municipality" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Grievances by status" />
          <CardBody>
            {grievanceByStatus.length ? (
              <BarList data={grievanceByStatus} color="bg-municipality" />
            ) : (
              <p className="text-sm text-slate-400">No grievances filed.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Summary" />
          <CardBody className="space-y-2 text-sm">
            <Row label="Total population" value={munCitizens.length} />
            <Row label="NID verified" value={munCitizens.filter((c) => c.nid_verified).length} />
            <Row label="ID cards issued" value={idcards.filter((c) => wardIds.has(c.ward_id) && (c.status === "APPROVED" || c.status === "COLLECTED")).length} />
            <Row label="Wards" value={munWards.length} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
