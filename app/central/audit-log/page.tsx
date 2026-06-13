"use client";

import { useMemo, useState } from "react";
import { auditLogSeed } from "@/lib/data";
import {
  PageHeader,
  Card,
  Table,
  Badge,
  Select,
  Input,
  optionsFromEnum,
} from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import type { AuditEvent } from "@/types";
import { formatDateTime, humanize } from "@/lib/utils";

const EVENT_TYPES = [
  "REGISTERED",
  "UPDATED",
  "APPROVED",
  "REJECTED",
  "CONFLICT_RESOLVED",
  "ID_CARD_ISSUED",
  "DATA_PURGED",
  "PASSWORD_RESET",
];

const ROLES = ["WARD_ADMIN", "LOCAL_BODY_ADMIN", "PROVINCE_ADMIN", "CENTRAL_ADMIN", "SYSTEM_ADMIN"];

export default function AuditLogPage() {
  const [eventType, setEventType] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");

  const rows = useMemo(
    () =>
      auditLogSeed
        .filter((e) => (eventType ? e.event_type === eventType : true))
        .filter((e) => (role ? e.acted_by_role === role : true))
        .filter((e) =>
          search ? e.jurisdiction.toLowerCase().includes(search.toLowerCase()) || e.citizen_id_masked.includes(search) : true
        ),
    [eventType, role, search]
  );

  const columns: Column<AuditEvent>[] = [
    { key: "timestamp", header: "Timestamp", sortValue: (e) => e.timestamp, render: (e) => formatDateTime(e.timestamp) },
    { key: "event_type", header: "Event", render: (e) => <Badge status={e.event_type} /> },
    { key: "citizen_id_masked", header: "Citizen", render: (e) => <span className="font-mono text-xs">{e.citizen_id_masked}</span> },
    { key: "acted_by_role", header: "Actor role", render: (e) => humanize(e.acted_by_role) },
    { key: "jurisdiction", header: "Jurisdiction", sortValue: (e) => e.jurisdiction },
  ];

  return (
    <div>
      <PageHeader title="Audit Log" subtitle={`${auditLogSeed.length} immutable events`} />

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select placeholder="All events" options={optionsFromEnum(EVENT_TYPES)} value={eventType} onChange={(e) => setEventType(e.target.value)} />
          <Select placeholder="All roles" options={optionsFromEnum(ROLES)} value={role} onChange={(e) => setRole(e.target.value)} />
          <Input placeholder="Search jurisdiction or citizen…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card>
        <Table columns={columns} rows={rows} rowKey={(e) => e.id} empty="No matching audit events." />
      </Card>
    </div>
  );
}
