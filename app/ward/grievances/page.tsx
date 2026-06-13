"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import {
  PageHeader,
  Card,
  Table,
  Badge,
  Button,
  Select,
  Modal,
  Textarea,
  optionsFromEnum,
  useToast,
} from "@/components/ui";
import type { Grievance, GrievanceCategory } from "@/types";
import type { Column } from "@/components/ui/Table";
import { formatDate, humanize, generateTrackingCode } from "@/lib/utils";
import Plus from "@mui/icons-material/Add";

const CATEGORIES = [
  "DATA_INACCURACY",
  "BENEFIT_DENIAL",
  "ID_CARD_ISSUE",
  "PRIVACY_VIOLATION",
  "SYSTEM_ACCESS",
  "OTHER",
];
const STATUSES = ["RECEIVED", "IN_PROGRESS", "RESOLVED_WARD", "REFERRED_JUDICIAL", "CLOSED"];

export default function GrievancesPage() {
  const { session } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const wardId = session?.jurisdiction_id ?? "ward-004";
  const [grievances] = useStore(store.grievances);
  const [citizens] = useStore(store.citizens);

  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [citizenId, setCitizenId] = useState("");
  const [category, setCategory] = useState("DATA_INACCURACY");
  const [description, setDescription] = useState("");

  const rows = useMemo(
    () =>
      grievances
        .filter((g) => g.ward_id === wardId)
        .filter((g) => (status ? g.status === status : true))
        .sort((a, b) => b.filed_at.localeCompare(a.filed_at)),
    [grievances, wardId, status]
  );

  const wardCitizens = citizens.filter((c) => c.ward_id === wardId);

  function fileGrievance() {
    if (!citizenId || !description) {
      toast("Citizen and description are required", "error");
      return;
    }
    const c = citizens.find((x) => x.id === citizenId)!;
    const code = generateTrackingCode();
    const g: Grievance = {
      id: `grv-${Date.now()}`,
      tracking_code: code,
      citizen_id: c.id,
      citizen_name: c.name_en,
      ward_id: wardId,
      category: category as GrievanceCategory,
      description,
      status: "RECEIVED",
      filed_at: new Date().toISOString(),
      sla_due: new Date(Date.now() + 15 * 86400000).toISOString(),
      timeline: [
        { status: "RECEIVED", at: new Date().toISOString(), actor: session?.full_name ?? "Ward Admin", note: "Grievance registered." },
      ],
    };
    store.setGrievances([g, ...store.grievances()]);
    setOpen(false);
    setCitizenId("");
    setDescription("");
    toast(`Grievance filed — ${code}`, "success");
    router.push(`/ward/grievances/${g.id}`);
  }

  const columns: Column<Grievance>[] = [
    { key: "tracking_code", header: "Tracking code", render: (g) => <span className="font-mono text-xs">{g.tracking_code}</span> },
    { key: "citizen_name", header: "Citizen", sortValue: (g) => g.citizen_name },
    { key: "category", header: "Category", render: (g) => humanize(g.category) },
    { key: "filed_at", header: "Filed", sortValue: (g) => g.filed_at, render: (g) => formatDate(g.filed_at) },
    { key: "status", header: "Status", render: (g) => <Badge status={g.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Grievances"
        subtitle="File and track citizen grievances"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> File Grievance
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="max-w-xs">
          <Select placeholder="All statuses" options={optionsFromEnum(STATUSES)} value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          rows={rows}
          rowKey={(g) => g.id}
          onRowClick={(g) => router.push(`/ward/grievances/${g.id}`)}
          empty="No grievances filed."
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="File Grievance"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={fileGrievance}>Submit</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Citizen"
            placeholder="Select citizen"
            options={wardCitizens.map((c) => ({ value: c.id, label: `${c.name_en} (${c.nid_masked})` }))}
            value={citizenId}
            onChange={(e) => setCitizenId(e.target.value)}
          />
          <Select label="Category" options={optionsFromEnum(CATEGORIES)} value={category} onChange={(e) => setCategory(e.target.value)} />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} maxChars={500} placeholder="Describe the grievance…" />
          <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400">
            File attachment placeholder
          </div>
        </div>
      </Modal>
    </div>
  );
}
