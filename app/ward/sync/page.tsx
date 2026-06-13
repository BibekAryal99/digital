"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import {
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardBody,
  Table,
  Badge,
  Modal,
} from "@/components/ui";
import type { SyncBatch } from "@/types";
import type { Column } from "@/components/ui/Table";
import { formatDateTime } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Upload, XCircle } from "lucide-react";

export default function SyncPage() {
  const { session } = useAuth();
  const wardId = session?.jurisdiction_id ?? "ward-004";
  const [batches] = useStore(store.batches);

  const wardBatches = useMemo(
    () => batches.filter((b) => b.ward_id === wardId),
    [batches, wardId]
  );

  const [selected, setSelected] = useState<SyncBatch | null>(null);

  const totalSynced = wardBatches.reduce(
    (s, b) => s + b.records.filter((r) => r.sync_status === "synced").length,
    0
  );
  const pending = wardBatches.reduce(
    (s, b) => s + b.records.filter((r) => r.sync_status === "pending").length,
    0
  );
  const conflicts = wardBatches.reduce((s, b) => s + b.conflict_count, 0);
  const failed = wardBatches.reduce((s, b) => s + b.failed_count, 0);

  const columns: Column<SyncBatch>[] = [
    { key: "id", header: "Batch", render: (b) => <span className="font-mono text-xs">{b.id.slice(0, 12)}…</span> },
    { key: "submitted_at", header: "Submitted", sortValue: (b) => b.submitted_at, render: (b) => formatDateTime(b.submitted_at) },
    { key: "record_count", header: "Records", align: "right", render: (b) => b.record_count },
    { key: "conflict_count", header: "Conflicts", align: "right", render: (b) => b.conflict_count },
    { key: "failed_count", header: "Failed", align: "right", render: (b) => b.failed_count },
    { key: "status", header: "Status", render: (b) => <Badge status={b.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Sync Status" subtitle="Offline sync monitoring" />

      {conflicts > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="text-sm text-red-800">
            <p className="font-semibold">{conflicts} unresolved conflict(s) detected.</p>
            <p>
              Conflicts must be resolved by your Local Body Administrator. Contact
              them with the conflict reference numbers.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Synced" value={totalSynced} icon={<CheckCircle2 />} accent="ward" />
        <StatCard label="Pending Upload" value={pending} icon={<Upload />} accent="ward" />
        <StatCard label="Conflicts" value={conflicts} icon={<AlertTriangle />} accent="ward" />
        <StatCard label="Failed Records" value={failed} icon={<XCircle />} accent="ward" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Sync batch history" />
        <Table
          columns={columns}
          rows={wardBatches}
          rowKey={(b) => b.id}
          onRowClick={(b) => setSelected(b)}
          empty="No sync batches for this ward."
        />
      </Card>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Batch detail"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Info label="Device" value={selected.device_id} />
              <Info label="Records" value={String(selected.record_count)} />
              <Info label="Conflicts" value={String(selected.conflict_count)} />
              <Info label="Submitted" value={formatDateTime(selected.submitted_at)} />
            </div>
            <Card>
              <CardHeader title="Records in batch" />
              <CardBody className="space-y-2">
                {selected.records.map((r) => (
                  <div key={r.citizen_id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <span className="text-sm text-slate-700">{r.citizen_name}</span>
                    <Badge status={r.sync_status} />
                  </div>
                ))}
              </CardBody>
            </Card>
            {selected.conflicts && selected.conflicts.length > 0 && (
              <Card accent="central">
                <CardHeader title="Conflicts (resolved by Municipality)" />
                <CardBody className="space-y-2">
                  {selected.conflicts.map((c) => (
                    <div key={c.id} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm">
                      <p className="font-medium text-red-800">{c.citizen_name} · ref {c.id}</p>
                      <p className="text-xs text-red-600">{c.fields.length} conflicting field(s)</p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-700">{value}</p>
    </div>
  );
}
