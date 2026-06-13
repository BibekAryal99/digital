"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wardLabel } from "@/lib/data";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Modal,
  EmptyState,
  useToast,
} from "@/components/ui";
import type { SyncConflict } from "@/types";
import { cn, formatDateTime, humanize } from "@/lib/utils";

type Pick = "server" | "device";

export default function ConflictsPage() {
  const { toast } = useToast();
  const [conflicts] = useStore(store.conflicts);
  const [active, setActive] = useState<SyncConflict | null>(null);
  const [picks, setPicks] = useState<Record<string, Pick>>({});

  const open = useMemo(
    () => conflicts.filter((c) => c.resolution_status === "PENDING_REVIEW"),
    [conflicts]
  );
  const resolved = useMemo(
    () => conflicts.filter((c) => c.resolution_status !== "PENDING_REVIEW"),
    [conflicts]
  );

  function openConflict(c: SyncConflict) {
    setActive(c);
    const initial: Record<string, Pick> = {};
    c.fields.forEach((f) => (initial[f.field] = "server"));
    setPicks(initial);
  }

  function resolve(mode: "MERGED" | "OVERWRITTEN") {
    if (!active) return;
    const all = store.conflicts();
    store.setConflicts(
      all.map((c) =>
        c.id === active.id ? { ...c, resolution_status: mode } : c
      )
    );
    // Apply chosen values to the citizen record.
    const citizens = store.citizens();
    store.setCitizens(
      citizens.map((c) => {
        if (c.id !== active.citizen_id) return c;
        const patch: Record<string, unknown> = {};
        active.fields.forEach((f) => {
          const chosen = mode === "OVERWRITTEN" ? "device" : picks[f.field];
          patch[f.field] = chosen === "device" ? f.device_value : f.server_value;
        });
        return { ...c, ...patch } as typeof c;
      })
    );
    toast(mode === "MERGED" ? "Conflict merged" : "Overwritten with device data", "success");
    setActive(null);
  }

  return (
    <div>
      <PageHeader title="Sync Conflicts" subtitle="Resolve field-level data conflicts" />

      {open.length === 0 ? (
        <EmptyState title="No open conflicts" message="All sync conflicts have been resolved." />
      ) : (
        <div className="space-y-3">
          {open.map((c) => (
            <Card key={c.id} accent="municipality">
              <CardBody className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800">{c.citizen_name}</p>
                    <Badge tone="red">{c.fields.length} conflict(s)</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {wardLabel(c.ward_id)} · device {c.device_id}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(c.created_at)}</p>
                </div>
                <Button onClick={() => openConflict(c)}>Resolve</Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Resolved conflicts" />
          <CardBody className="space-y-2">
            {resolved.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <span className="text-sm text-slate-700">{c.citizen_name} · {wardLabel(c.ward_id)}</span>
                <Badge tone={c.resolution_status === "MERGED" ? "green" : "blue"}>
                  {humanize(c.resolution_status)}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title={`Merge — ${active?.citizen_name}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => resolve("OVERWRITTEN")}>
              Overwrite all with device
            </Button>
            <Button onClick={() => resolve("MERGED")}>Save merge</Button>
          </>
        }
      >
        {active && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Choose the correct value for each conflicting field. The server value is
              what is currently stored; the device value came from the offline sync.
            </p>
            {active.fields.map((f) => (
              <div key={f.field} className="rounded-lg border border-slate-200 p-3">
                <p className="mb-2 text-sm font-semibold text-slate-700">{humanize(f.field)}</p>
                <div className="grid grid-cols-2 gap-3">
                  <ChoiceBox
                    label="Server value"
                    value={f.server_value}
                    selected={picks[f.field] === "server"}
                    onClick={() => setPicks((p) => ({ ...p, [f.field]: "server" }))}
                  />
                  <ChoiceBox
                    label="Device value"
                    value={f.device_value}
                    selected={picks[f.field] === "device"}
                    onClick={() => setPicks((p) => ({ ...p, [f.field]: "device" }))}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

function ChoiceBox({
  label,
  value,
  selected,
  onClick,
}: {
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border-2 px-3 py-2 text-left transition-colors",
        selected
          ? "border-municipality bg-orange-50"
          : "border-slate-200 hover:border-slate-300"
      )}
    >
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </button>
  );
}
