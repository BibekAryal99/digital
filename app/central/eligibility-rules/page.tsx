"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import {
  PageHeader,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Input,
  Textarea,
  Select,
  Checkbox,
  optionsFromEnum,
  useToast,
} from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import type { EligibilityRule, BenefitType } from "@/types";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const BENEFITS = [
  "UNEMPLOYMENT_ID",
  "DISABILITY_ID",
  "SENIOR_CITIZEN",
  "SINGLE_WOMAN",
  "FOOD_SUBSIDY",
  "HEALTH_INSURANCE",
];

const EMPTY: Partial<EligibilityRule> = {
  rule_name: "",
  benefit_type: "SENIOR_CITIZEN",
  condition_summary: "",
  condition_expression: "",
  benefit_value: "",
  priority: 5,
  is_active: true,
};

export default function EligibilityRulesPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [rules] = useStore(store.rules);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<EligibilityRule>>(EMPTY);
  const editing = Boolean(draft.id);

  function openNew() {
    setDraft(EMPTY);
    setOpen(true);
  }
  function openEdit(r: EligibilityRule) {
    setDraft(r);
    setOpen(true);
  }

  function save() {
    if (!draft.rule_name || !draft.benefit_value) {
      toast("Rule name and benefit value are required", "error");
      return;
    }
    const all = store.rules();
    const actor = session?.full_name ?? "Central Admin";
    if (editing) {
      store.setRules(
        all.map((r) =>
          r.id === draft.id
            ? {
                ...(draft as EligibilityRule),
                history: [
                  ...(r.history ?? []),
                  { at: new Date().toISOString(), by: actor, action: "Updated rule" },
                ],
              }
            : r
        )
      );
      toast("Rule updated", "success");
    } else {
      const rule: EligibilityRule = {
        id: `rule-${Date.now()}`,
        rule_name: draft.rule_name!,
        benefit_type: draft.benefit_type as BenefitType,
        condition_summary: draft.condition_summary ?? "",
        condition_expression: draft.condition_expression ?? "",
        benefit_value: draft.benefit_value!,
        priority: Number(draft.priority ?? 5),
        is_active: draft.is_active ?? true,
        affected_count: 0,
        created_at: new Date().toISOString(),
        history: [{ at: new Date().toISOString(), by: actor, action: "Created rule" }],
      };
      store.setRules([rule, ...all]);
      toast("Rule created", "success");
    }
    setOpen(false);
  }

  function toggle(r: EligibilityRule) {
    store.setRules(
      store.rules().map((x) =>
        x.id === r.id
          ? {
              ...x,
              is_active: !x.is_active,
              history: [
                ...(x.history ?? []),
                { at: new Date().toISOString(), by: session?.full_name ?? "Central Admin", action: x.is_active ? "Deactivated" : "Activated" },
              ],
            }
          : x
      )
    );
    toast(r.is_active ? "Rule deactivated" : "Rule activated", "success");
  }

  const columns: Column<EligibilityRule>[] = [
    { key: "priority", header: "Pri", align: "center", sortValue: (r) => r.priority, render: (r) => <span className="font-mono">{r.priority}</span> },
    { key: "rule_name", header: "Rule", sortValue: (r) => r.rule_name, render: (r) => (
      <div>
        <p className="font-medium text-slate-800">{r.rule_name}</p>
        <p className="text-xs text-slate-400">{r.condition_summary}</p>
      </div>
    ) },
    { key: "benefit_type", header: "Benefit", render: (r) => <Badge status={r.benefit_type} /> },
    { key: "benefit_value", header: "Value", render: (r) => r.benefit_value },
    { key: "affected_count", header: "Affected", align: "right", sortValue: (r) => r.affected_count },
    { key: "is_active", header: "Status", render: (r) => <Badge tone={r.is_active ? "green" : "gray"}>{r.is_active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(r)}>Edit</Button>
          <Button size="sm" variant={r.is_active ? "danger" : "primary"} onClick={() => toggle(r)}>
            {r.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Eligibility Rules"
        subtitle="Define benefit eligibility criteria"
        action={<Button onClick={openNew}><Plus className="h-4 w-4" /> New Rule</Button>}
      />

      <Card>
        <Table columns={columns} rows={rules} rowKey={(r) => r.id} empty="No rules defined." />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit rule" : "New eligibility rule"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create rule"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label="Rule name" value={draft.rule_name ?? ""} onChange={(e) => setDraft({ ...draft, rule_name: e.target.value })} />
          <Select label="Benefit type" options={optionsFromEnum(BENEFITS)} value={draft.benefit_type ?? ""} onChange={(e) => setDraft({ ...draft, benefit_type: e.target.value as BenefitType })} />
          <Input label="Benefit value" value={draft.benefit_value ?? ""} onChange={(e) => setDraft({ ...draft, benefit_value: e.target.value })} placeholder="e.g. NPR 4000/month" />
          <Input label="Priority (1=highest)" type="number" value={String(draft.priority ?? 5)} onChange={(e) => setDraft({ ...draft, priority: Number(e.target.value) })} />
          <div className="md:col-span-2">
            <Input label="Condition summary" value={draft.condition_summary ?? ""} onChange={(e) => setDraft({ ...draft, condition_summary: e.target.value })} placeholder="Plain-language description" />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Condition expression" value={draft.condition_expression ?? ""} onChange={(e) => setDraft({ ...draft, condition_expression: e.target.value })} placeholder="e.g. age >= 68" />
          </div>
          <div className="md:col-span-2">
            <Checkbox label="Active" checked={draft.is_active ?? true} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
          </div>
        </div>
        {editing && draft.history && draft.history.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-sm font-semibold text-slate-600">History</p>
            <div className="space-y-1">
              {draft.history.map((h, i) => (
                <p key={i} className="text-xs text-slate-400">
                  {formatDate(h.at)} — {h.action} by {h.by}
                </p>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
