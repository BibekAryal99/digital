"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wardLabel } from "@/lib/data";
import { evaluateEligibility } from "@/lib/eligibility";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Avatar,
  Tabs,
  Modal,
  Input,
  Textarea,
  EmptyState,
  useToast,
} from "@/components/ui";
import type { EditApproval } from "@/types";
import { ageFromDob, formatDate, formatDateTime, humanize } from "@/lib/utils";
import { ArrowLeft, Pencil } from "lucide-react";

const TABS = [
  { key: "identity", label: "Identity" },
  { key: "family", label: "Family" },
  { key: "employment", label: "Employment" },
  { key: "education", label: "Education" },
  { key: "disability", label: "Disability" },
  { key: "household", label: "Household" },
  { key: "idcards", label: "ID Cards" },
  { key: "audit", label: "Audit" },
];

export default function CitizenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { session } = useAuth();
  const { toast } = useToast();
  const [citizens] = useStore(store.citizens);
  const [idcards] = useStore(store.idcards);
  const [rules] = useStore(store.rules);

  const citizen = citizens.find((c) => c.id === id);
  const [tab, setTab] = useState("identity");
  const [editOpen, setEditOpen] = useState(false);
  const [editField, setEditField] = useState<{ field: string; label: string; value: string } | null>(null);
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");

  const eligibility = useMemo(
    () => (citizen ? evaluateEligibility(citizen, rules) : []),
    [citizen, rules]
  );

  if (!citizen) {
    return (
      <div>
        <Link href="/ward/citizens" className="text-sm text-navy-700 hover:underline">
          ← Back to citizens
        </Link>
        <EmptyState title="Citizen not found" message={`No record for ${id}.`} />
      </div>
    );
  }

  const citizenCards = idcards.filter((c) => c.citizen_id === citizen.id);

  function openEdit(field: string, label: string, value: string) {
    setEditField({ field, label, value });
    setNewValue(value);
    setReason("");
    setEditOpen(true);
  }

  function submitEdit() {
    if (!editField || !citizen) return;
    const approvals = store.approvals();
    const entry: EditApproval = {
      id: `edit-${Date.now()}`,
      citizen_id: citizen.id,
      citizen_name: citizen.name_en,
      ward_id: citizen.ward_id,
      submitted_by: session?.full_name ?? "Ward Admin",
      submitter_id: session?.user_id ?? "usr-001",
      submitted_at: new Date().toISOString(),
      reason: reason || "Field correction",
      status: "PENDING",
      changes: [
        {
          field: editField.field,
          old_value: editField.value,
          new_value: newValue,
        },
      ],
      escalated_at: null,
      decision_note: "",
    };
    store.setApprovals([entry, ...approvals]);
    setEditOpen(false);
    toast("Edit submitted for approval", "success");
  }

  return (
    <div>
      <Link
        href="/ward/citizens"
        className="mb-3 inline-flex items-center gap-1 text-sm text-navy-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to citizens
      </Link>

      <PageHeader title={citizen.name_en} subtitle={wardLabel(citizen.ward_id)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <div className="flex items-center gap-4 border-b border-slate-100 p-5">
            <Avatar nameNp={citizen.name_np} size="lg" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {citizen.name_en}
              </h2>
              <p className="text-sm text-slate-500">{citizen.name_np}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {citizen.nid_verified ? (
                  <Badge status="VERIFIED">NID Verified</Badge>
                ) : (
                  <Badge tone="gray">NID Unverified</Badge>
                )}
                <Badge status={citizen.sync_status} />
                <Badge tone="blue">{humanize(citizen.employment_category)}</Badge>
              </div>
            </div>
          </div>

          <div className="px-5 pt-3">
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
          </div>

          <CardBody>
            {tab === "identity" && (
              <FieldList
                rows={[
                  ["name_en", "Full name (EN)", citizen.name_en],
                  ["name_np", "Full name (NP)", citizen.name_np],
                  ["nid_masked", "NID", citizen.nid_masked],
                  ["dob", "Date of birth", `${formatDate(citizen.dob)} (age ${ageFromDob(citizen.dob)})`],
                  ["sex", "Sex", humanize(citizen.sex)],
                  ["blood_group", "Blood group", citizen.blood_group ?? "—"],
                  ["religion", "Religion", citizen.religion ?? "—"],
                  ["ethnicity", "Ethnicity", citizen.ethnicity ?? "—"],
                  ["mother_tongue", "Mother tongue", citizen.mother_tongue ?? "—"],
                  ["tole", "Tole", citizen.tole],
                  ["digital_literacy", "Digital literacy", humanize(citizen.digital_literacy)],
                  ["consent_channel", "Consent channel", humanize(citizen.consent_channel)],
                ]}
                onEdit={openEdit}
              />
            )}

            {tab === "family" && (
              <div className="space-y-2">
                {(citizen.family ?? []).length === 0 && (
                  <p className="text-sm text-slate-400">No family members recorded.</p>
                )}
                {(citizen.family ?? []).map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {m.name}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          ({humanize(m.relation)})
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Citizenship: {m.citizenship_no || "—"}
                      </p>
                    </div>
                    <Badge tone={m.link_status === "linked" ? "green" : "amber"}>
                      {humanize(m.link_status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {tab === "employment" && (
              <FieldList
                rows={[
                  ["employment_category", "Category", humanize(citizen.employment_category)],
                  ["income_band", "Income band", humanize(citizen.income_band)],
                  ...Object.entries(citizen.employment?.details ?? {}).map(
                    ([k, v]) => [k, humanize(k), String(v)] as [string, string, string]
                  ),
                ]}
                onEdit={openEdit}
              />
            )}

            {tab === "education" && citizen.education && (
              <FieldList
                rows={[
                  ["education_level", "Level", humanize(citizen.education.level)],
                  ["institution_name", "Institution", citizen.education.institution_name],
                  ["institution_type", "Institution type", humanize(citizen.education.institution_type)],
                  ["study_location", "Study location", humanize(citizen.education.study_location)],
                  ["is_dropout", "Dropout", citizen.education.is_dropout ? "Yes" : "No"],
                ]}
                onEdit={openEdit}
              />
            )}

            {tab === "disability" &&
              (citizen.disability ? (
                <FieldList
                  rows={[
                    ["disability_type", "Type", humanize(citizen.disability.disability_type)],
                    ["severity_body", "Body function severity", `${citizen.disability.severity_body} / 4`],
                    ["severity_activity", "Activity severity", `${citizen.disability.severity_activity} / 4`],
                    ["severity_participation", "Participation severity", `${citizen.disability.severity_participation} / 4`],
                    ["certificate_no", "Certificate no.", citizen.disability.certificate_no],
                    ["issuing_hospital", "Issuing hospital", citizen.disability.issuing_hospital],
                    ["expiry_date", "Expiry", formatDate(citizen.disability.expiry_date)],
                  ]}
                  onEdit={openEdit}
                />
              ) : (
                <p className="text-sm text-slate-400">No disability profile recorded.</p>
              ))}

            {tab === "household" && citizen.household && (
              <FieldList
                rows={[
                  ["house_type", "House type", citizen.household.house_type],
                  ["construction_type", "Construction", citizen.household.construction_type],
                  ["room_count", "Rooms", String(citizen.household.room_count)],
                  ["electricity_source", "Electricity", citizen.household.electricity_source],
                  ["water_source", "Water", citizen.household.water_source],
                  ["sanitation", "Sanitation", citizen.household.sanitation],
                  ["internet_access", "Internet", citizen.household.internet_access ? "Yes" : "No"],
                  ["bank_account", "Bank account", citizen.household.bank_account ? "Yes" : "No"],
                  ["poverty_class", "Poverty class", humanize(citizen.household.poverty_class)],
                ]}
                onEdit={openEdit}
              />
            )}

            {tab === "idcards" && (
              <div className="space-y-2">
                {citizenCards.length === 0 && (
                  <p className="text-sm text-slate-400">No ID cards issued.</p>
                )}
                {citizenCards.map((c) => (
                  <Link
                    key={c.id}
                    href={`/ward/id-cards/${c.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2 hover:bg-slate-50"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {humanize(c.card_type)} Card
                    </span>
                    <Badge status={c.status} />
                  </Link>
                ))}
              </div>
            )}

            {tab === "audit" && (
              <div className="space-y-2 text-sm">
                <AuditRow at={citizen.created_at} text="Citizen registered" />
                {citizen.consent_recorded_at && (
                  <AuditRow at={citizen.consent_recorded_at} text={`Consent recorded (${humanize(citizen.consent_channel)})`} />
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Eligibility sidebar */}
        <Card accent="ward" className="h-fit">
          <CardHeader title="Benefit eligibility" subtitle="Based on current data" />
          <CardBody className="space-y-3">
            {eligibility.length === 0 ? (
              <p className="text-sm text-slate-400">
                Not currently eligible for any benefit.
              </p>
            ) : (
              eligibility.map((e) => (
                <div
                  key={e.benefit_type}
                  className="rounded-lg border border-slate-100 p-3"
                >
                  <Badge status={e.benefit_type} />
                  <p className="mt-1 text-xs text-slate-500">{e.reason}</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit: ${editField?.label}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={newValue === editField?.value}>
              Submit for approval
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Current value" value={editField?.value ?? ""} disabled />
          <Input
            label="New value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <Textarea
            label="Reason for change"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Correction per citizenship certificate"
          />
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            This change will not update the record directly. It is submitted to the
            Municipality for approval.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function FieldList({
  rows,
  onEdit,
}: {
  rows: [string, string, string][];
  onEdit: (field: string, label: string, value: string) => void;
}) {
  return (
    <div className="divide-y divide-slate-100">
      {rows.map(([field, label, value]) => (
        <div key={field} className="flex items-center justify-between py-2.5">
          <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm font-medium text-slate-700">{value}</p>
          </div>
          <button
            onClick={() => onEdit(field, label, value)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-700"
            title="Propose edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function AuditRow({ at, text }: { at: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ward" />
      <div>
        <p className="text-slate-700">{text}</p>
        <p className="text-xs text-slate-400">{formatDateTime(at)}</p>
      </div>
    </div>
  );
}
