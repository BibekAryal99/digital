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
  Table,
  Badge,
  Button,
} from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import type { Grievance } from "@/types";
import { downloadCsv } from "@/lib/csv";
import { daysUntil, formatDate, humanize } from "@/lib/utils";
import Download from "@mui/icons-material/Download";

export default function ProvinceReportsPage() {
  const { session } = useAuth();
  const provId = session?.jurisdiction_id ?? "prov-koshi";
  const [grievances] = useStore(store.grievances);

  const provWards = useMemo(() => wards.filter((w) => w.province_id === provId), [provId]);
  const wardIds = useMemo(() => new Set(provWards.map((w) => w.id)), [provWards]);

  const provGrievances = useMemo(
    () => grievances.filter((g) => wardIds.has(g.ward_id)),
    [grievances, wardIds]
  );

  const open = provGrievances.filter((g) => g.status !== "CLOSED" && g.status !== "RESOLVED_WARD");
  const breached = open.filter((g) => daysUntil(g.sla_due) < 0);
  const referred = provGrievances.filter((g) => g.status === "REFERRED_JUDICIAL");

  const columns: Column<Grievance>[] = [
    { key: "tracking_code", header: "Code", render: (g) => <span className="font-mono text-xs">{g.tracking_code}</span> },
    { key: "citizen_name", header: "Citizen", sortValue: (g) => g.citizen_name },
    { key: "category", header: "Category", render: (g) => humanize(g.category) },
    { key: "sla_due", header: "SLA due", sortValue: (g) => g.sla_due, render: (g) => formatDate(g.sla_due) },
    {
      key: "status",
      header: "Status",
      render: (g) => (
        <div className="flex items-center gap-2">
          <Badge status={g.status} />
          {daysUntil(g.sla_due) < 0 && g.status !== "RESOLVED_WARD" && g.status !== "CLOSED" && (
            <Badge tone="red">Overdue</Badge>
          )}
        </div>
      ),
    },
  ];

  function exportGrievances() {
    downloadCsv(
      "province-grievances.csv",
      provGrievances.map((g) => ({
        tracking_code: g.tracking_code,
        citizen: g.citizen_name,
        ward: g.ward_id,
        category: g.category,
        status: g.status,
        filed_at: g.filed_at,
        sla_due: g.sla_due,
      }))
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports & Grievance Monitoring"
        subtitle={session?.jurisdiction_name ?? "Koshi Province"}
        action={
          <Button onClick={exportGrievances} className="no-print">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Stat label="Total grievances" value={provGrievances.length} />
        <Stat label="Open" value={open.length} />
        <Stat label="SLA breached" value={breached.length} tone="red" />
        <Stat label="Referred to judicial" value={referred.length} tone="orange" />
      </div>

      <Card>
        <CardHeader title="Grievance register" />
        <Table columns={columns} rows={provGrievances} rowKey={(g) => g.id} empty="No grievances filed in this province." />
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "red" | "orange" }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={
          tone === "red"
            ? "mt-1 text-2xl font-bold text-red-600"
            : tone === "orange"
            ? "mt-1 text-2xl font-bold text-orange-600"
            : "mt-1 text-2xl font-bold text-slate-900"
        }
      >
        {value}
      </p>
    </Card>
  );
}
