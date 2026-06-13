"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wards } from "@/lib/data";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Modal,
  Input,
  Textarea,
  Select,
  optionsFromEnum,
  EmptyState,
  useToast,
} from "@/components/ui";
import type { AnomalyFlag } from "@/lib/store";
import { formatDateTime, humanize } from "@/lib/utils";
import Flag from "@mui/icons-material/Flag";

const TYPES = ["DATA_INCONSISTENCY", "DUPLICATE_SUSPECTED", "MISSING_CONSENT", "OTHER"];

export default function FlagAnomalyPage() {
  const { toast } = useToast();
  const [flags] = useStore(store.flags);
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState<AnomalyFlag | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const [hint, setHint] = useState("");
  const [wardId, setWardId] = useState("");
  const [type, setType] = useState("DATA_INCONSISTENCY");
  const [note, setNote] = useState("");

  function createFlag() {
    if (!hint || !wardId || !note) {
      toast("Fill all fields", "error");
      return;
    }
    const w = wards.find((x) => x.id === wardId);
    const flag: AnomalyFlag = {
      id: `flag-${Date.now()}`,
      citizen_masked: `****${Math.floor(1000 + Math.random() * 9000)}`,
      citizen_hint: hint,
      ward_id: wardId,
      responsible_municipality: w?.municipality_name ?? "—",
      anomaly_type: type as AnomalyFlag["anomaly_type"],
      note,
      flagged_at: new Date().toISOString(),
      resolution_status: "OPEN",
    };
    store.setFlags([flag, ...store.flags()]);
    toast("Anomaly flagged & routed to municipality", "success");
    setOpen(false);
    setHint(""); setWardId(""); setNote("");
  }

  function resolve() {
    if (!resolving) return;
    store.setFlags(
      store.flags().map((f) =>
        f.id === resolving.id
          ? { ...f, resolution_status: "RESOLVED", resolution_note: resolutionNote }
          : f
      )
    );
    toast("Flag resolved", "success");
    setResolving(null);
    setResolutionNote("");
  }

  const openFlags = flags.filter((f) => f.resolution_status === "OPEN");
  const resolved = flags.filter((f) => f.resolution_status === "RESOLVED");

  return (
    <div>
      <PageHeader
        title="Flag Anomaly"
        subtitle="Privacy-preserving anomaly reporting"
        action={<Button onClick={() => setOpen(true)}><Flag className="h-4 w-4" /> Flag Anomaly</Button>}
      />

      {openFlags.length === 0 ? (
        <EmptyState title="No open anomalies" message="Flag a data anomaly to route it to the responsible municipality." />
      ) : (
        <div className="space-y-3">
          {openFlags.map((f) => (
            <Card key={f.id} accent="central">
              <CardBody className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone="red">{humanize(f.anomaly_type)}</Badge>
                    <span className="font-mono text-xs text-slate-400">{f.citizen_masked}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{f.note}</p>
                  <p className="text-xs text-slate-400">
                    {f.citizen_hint} · {f.responsible_municipality} · {formatDateTime(f.flagged_at)}
                  </p>
                </div>
                <Button variant="outline" onClick={() => { setResolving(f); setResolutionNote(""); }}>
                  Resolve
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Resolved anomalies" />
          <CardBody className="space-y-2">
            {resolved.map((f) => (
              <div key={f.id} className="rounded-lg border border-slate-100 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{humanize(f.anomaly_type)} · {f.responsible_municipality}</span>
                  <Badge tone="green">Resolved</Badge>
                </div>
                {f.resolution_note && <p className="mt-1 text-xs text-slate-400">{f.resolution_note}</p>}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Flag Anomaly"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={createFlag}>Flag</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            For privacy, citizen identity is masked. Provide a non-identifying hint so the
            municipality can locate the record.
          </p>
          <Input label="Citizen hint" value={hint} onChange={(e) => setHint(e.target.value)} placeholder="e.g. Ward 4, registered Jan 2026" />
          <Select
            label="Ward"
            placeholder="Select ward"
            options={wards.map((w) => ({ value: w.id, label: `Ward ${w.ward_no} — ${w.name_en}` }))}
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
          />
          <Select label="Anomaly type" options={optionsFromEnum(TYPES)} value={type} onChange={(e) => setType(e.target.value)} />
          <Textarea label="Details" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={resolving !== null}
        onClose={() => setResolving(null)}
        title="Resolve anomaly"
        footer={
          <>
            <Button variant="outline" onClick={() => setResolving(null)}>Cancel</Button>
            <Button onClick={resolve}>Mark resolved</Button>
          </>
        }
      >
        <Textarea label="Resolution note" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} />
      </Modal>
    </div>
  );
}
