"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wardLabel } from "@/lib/data";
import {
  PageHeader,
  Card,
  CardBody,
  Badge,
  Button,
  Tabs,
  Modal,
  Textarea,
  DiffViewer,
  EmptyState,
  useToast,
} from "@/components/ui";
import type { ApprovalStatus, EditApproval } from "@/types";
import { formatDateTime } from "@/lib/utils";

const FILTERS = [
  { key: "PENDING", label: "Pending" },
  { key: "CAO_REVIEW", label: "CAO Review" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

// Field changes touching identity/NID require CAO (Chief Admin Officer) sign-off.
const SENSITIVE = ["name_en", "name_np", "nid_masked", "dob"];

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [approvals] = useStore(store.approvals);
  const [filter, setFilter] = useState("PENDING");
  const [active, setActive] = useState<EditApproval | null>(null);
  const [note, setNote] = useState("");

  const rows = useMemo(
    () => approvals.filter((a) => a.status === filter),
    [approvals, filter]
  );

  function decide(a: EditApproval, status: ApprovalStatus, decisionNote: string) {
    const all = store.approvals();
    store.setApprovals(
      all.map((x) =>
        x.id === a.id
          ? {
              ...x,
              status,
              decision_note: decisionNote,
              escalated_at: status === "CAO_REVIEW" ? new Date().toISOString() : x.escalated_at,
            }
          : x
      )
    );

    // On final approval, apply the change to the citizen record.
    if (status === "APPROVED") {
      const citizens = store.citizens();
      store.setCitizens(
        citizens.map((c) => {
          if (c.id !== a.citizen_id) return c;
          const patch: Record<string, unknown> = {};
          a.changes.forEach((ch) => (patch[ch.field] = ch.new_value));
          return { ...c, ...patch } as typeof c;
        })
      );
    }
  }

  const needsCao = active ? active.changes.some((c) => SENSITIVE.includes(c.field)) : false;

  return (
    <div>
      <PageHeader title="Edit Approvals" subtitle="Review citizen data changes from wards" />

      <Tabs
        tabs={FILTERS}
        active={filter}
        onChange={(k) => setFilter(k)}
        className="mb-4"
      />

      {rows.length === 0 ? (
        <EmptyState title="Nothing here" message={`No ${filter.toLowerCase().replace("_", " ")} requests.`} />
      ) : (
        <div className="space-y-3">
          {rows.map((a) => (
            <Card key={a.id}>
              <CardBody className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800">{a.citizen_name}</p>
                    <Badge status={a.status} />
                    {a.changes.some((c) => SENSITIVE.includes(c.field)) && (
                      <Badge tone="orange">CAO sign-off required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {wardLabel(a.ward_id)} · {a.changes.length} field(s) · by {a.submitted_by}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(a.submitted_at)} · {a.reason}</p>
                </div>
                <Button variant="outline" onClick={() => { setActive(a); setNote(""); }}>
                  Review
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title={`Review — ${active?.citizen_name}`}
        size="lg"
        footer={
          active && (active.status === "PENDING" || active.status === "CAO_REVIEW") ? (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  decide(active, "REJECTED", note || "Rejected");
                  toast("Request rejected", "success");
                  setActive(null);
                }}
              >
                Reject
              </Button>
              {needsCao && active.status === "PENDING" ? (
                <Button
                  onClick={() => {
                    decide(active, "CAO_REVIEW", note || "Escalated to CAO");
                    toast("Escalated to CAO review", "success");
                    setActive(null);
                  }}
                >
                  Escalate to CAO
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    decide(active, "APPROVED", note || "Approved");
                    toast("Request approved & applied", "success");
                    setActive(null);
                  }}
                >
                  {active.status === "CAO_REVIEW" ? "CAO Approve" : "Approve"}
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
          )
        }
      >
        {active && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Citizen" value={active.citizen_name} />
              <Info label="Ward" value={wardLabel(active.ward_id)} />
              <Info label="Submitted by" value={active.submitted_by} />
              <Info label="Reason" value={active.reason} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-600">Proposed changes</p>
              <DiffViewer changes={active.changes} />
            </div>
            {needsCao && (
              <p className="rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
                This request modifies identity fields and requires Chief Admin Officer (CAO) approval before being applied.
              </p>
            )}
            {(active.status === "PENDING" || active.status === "CAO_REVIEW") && (
              <Textarea
                label="Decision note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note recorded with your decision"
              />
            )}
            {active.decision_note && active.status !== "PENDING" && (
              <Info label="Decision note" value={active.decision_note} />
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
