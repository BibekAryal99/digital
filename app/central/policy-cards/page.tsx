"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import {
  PageHeader,
  Card,
  CardBody,
  Badge,
  Button,
  Select,
  Modal,
  Tabs,
  optionsFromEnum,
  useToast,
} from "@/components/ui";
import type { PolicyCard, PolicyStatus } from "@/types";
import { formatDate, humanize } from "@/lib/utils";

const CATEGORIES = ["EMPLOYMENT", "HEALTH", "EDUCATION", "INFRASTRUCTURE", "BENEFITS", "DISASTER"];

const NEXT: Record<PolicyStatus, PolicyStatus[]> = {
  PENDING_REVIEW: ["ACKNOWLEDGED", "DISMISSED"],
  ACKNOWLEDGED: ["IN_PROGRESS", "DISMISSED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  DISMISSED: [],
};

export default function PolicyCardsPage() {
  const { toast } = useToast();
  const [policies] = useStore(store.policies);
  const [tab, setTab] = useState("all");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState<PolicyCard | null>(null);

  const filtered = useMemo(
    () =>
      policies
        .filter((p) => (tab === "all" ? true : tab === "open" ? p.status !== "COMPLETED" && p.status !== "DISMISSED" : p.status === "COMPLETED"))
        .filter((p) => (category ? p.category === category : true)),
    [policies, tab, category]
  );

  function advance(p: PolicyCard, status: PolicyStatus) {
    store.setPolicies(store.policies().map((x) => (x.id === p.id ? { ...x, status } : x)));
    toast(`Marked ${humanize(status)}`, "success");
    setActive(null);
  }

  return (
    <div>
      <PageHeader title="Policy Cards" subtitle="AI-suggested policy actions from national data" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
            { key: "all", label: "All" },
            { key: "open", label: "Open" },
            { key: "done", label: "Completed" },
          ]}
          active={tab}
          onChange={setTab}
        />
        <div className="w-56">
          <Select placeholder="All categories" options={optionsFromEnum(CATEGORIES)} value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <Card key={p.id} accent="central" className="flex flex-col">
            <CardBody className="flex flex-1 flex-col">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge tone="blue">{humanize(p.category)}</Badge>
                <Badge status={p.status} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-500">{p.description}</p>
              <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                <p><strong>Action:</strong> {p.suggested_action}</p>
                <p><strong>Deadline:</strong> {formatDate(p.suggested_deadline)}</p>
                <p><strong>Province:</strong> {p.province}</p>
              </div>
              <Button variant="outline" className="mt-3" onClick={() => setActive(p)}>
                Manage
              </Button>
            </CardBody>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400">No policy cards match.</p>
        )}
      </div>

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title={active?.title}
        footer={
          active && NEXT[active.status].length > 0 ? (
            <div className="flex gap-2">
              {NEXT[active.status].map((s) => (
                <Button
                  key={s}
                  variant={s === "DISMISSED" ? "danger" : "primary"}
                  onClick={() => advance(active, s)}
                >
                  {humanize(s)}
                </Button>
              ))}
            </div>
          ) : (
            <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
          )
        }
      >
        {active && (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">{active.description}</p>
            <div className="rounded-lg bg-slate-50 p-3">
              <p><strong>Suggested action:</strong> {active.suggested_action}</p>
              <p><strong>Deadline:</strong> {formatDate(active.suggested_deadline)}</p>
              <p><strong>Province:</strong> {active.province}</p>
              <p><strong>Status:</strong> {humanize(active.status)}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
