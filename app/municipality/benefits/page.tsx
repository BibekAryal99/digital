"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wards } from "@/lib/data";
import { evaluateEligibility } from "@/lib/eligibility";
import {
  PageHeader,
  Card,
  CardHeader,
  Table,
  Badge,
  Button,
  Select,
  Input,
  Modal,
  StatCard,
  Tabs,
  optionsFromEnum,
  useToast,
} from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import type { Citizen } from "@/types";
import type { Disbursement } from "@/lib/store";
import { formatDate, formatNpr, humanize } from "@/lib/utils";
import { HandCoins, Users } from "lucide-react";

interface EligibleRow {
  citizen: Citizen;
  benefits: { benefit_type: string; rule_name: string }[];
}

export default function BenefitsPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const munId = session?.jurisdiction_id ?? "mun-001";
  const [citizens] = useStore(store.citizens);
  const [rules] = useStore(store.rules);
  const [disbursements] = useStore(store.disbursements);

  const [tab, setTab] = useState("eligible");
  const [benefitFilter, setBenefitFilter] = useState("");
  const [target, setTarget] = useState<EligibleRow | null>(null);

  const [benefitType, setBenefitType] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");

  const wardIds = useMemo(
    () => new Set(wards.filter((w) => w.municipality_id === munId).map((w) => w.id)),
    [munId]
  );

  const eligible = useMemo<EligibleRow[]>(() => {
    return citizens
      .filter((c) => wardIds.has(c.ward_id))
      .map((c) => ({ citizen: c, benefits: evaluateEligibility(c, rules) }))
      .filter((r) => r.benefits.length > 0)
      .filter((r) =>
        benefitFilter ? r.benefits.some((b) => b.benefit_type === benefitFilter) : true
      );
  }, [citizens, rules, wardIds, benefitFilter]);

  const totalDisbursed = disbursements.reduce((s, d) => s + d.amount, 0);

  function openDisburse(row: EligibleRow) {
    setTarget(row);
    setBenefitType(row.benefits[0]?.benefit_type ?? "");
    setAmount("");
    setMethod("BANK_TRANSFER");
  }

  function disburse() {
    if (!target || !amount) {
      toast("Enter an amount", "error");
      return;
    }
    const d: Disbursement = {
      id: `dsb-${Date.now()}`,
      citizen_id: target.citizen.id,
      citizen_name: target.citizen.name_en,
      benefit_type: benefitType,
      amount: Number(amount),
      method: method as Disbursement["method"],
      period_start: new Date().toISOString().slice(0, 10),
      period_end: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      disbursed_by: session?.full_name ?? "Municipality",
      created_at: new Date().toISOString(),
    };
    store.setDisbursements([d, ...store.disbursements()]);
    toast("Disbursement recorded", "success");
    setTarget(null);
  }

  const eligColumns: Column<EligibleRow>[] = [
    { key: "name", header: "Citizen", sortValue: (r) => r.citizen.name_en, render: (r) => r.citizen.name_en },
    {
      key: "benefits",
      header: "Eligible benefits",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.benefits.map((b) => (
            <Badge key={b.benefit_type} status={b.benefit_type} />
          ))}
        </div>
      ),
    },
    { key: "income", header: "Income", render: (r) => humanize(r.citizen.income_band) },
    {
      key: "action",
      header: "",
      align: "right",
      render: (r) => (
        <Button size="sm" onClick={() => openDisburse(r)}>
          Disburse
        </Button>
      ),
    },
  ];

  const disbColumns: Column<Disbursement>[] = [
    { key: "citizen_name", header: "Citizen", sortValue: (d) => d.citizen_name },
    { key: "benefit_type", header: "Benefit", render: (d) => humanize(d.benefit_type) },
    { key: "amount", header: "Amount", align: "right", render: (d) => formatNpr(d.amount) },
    { key: "method", header: "Method", render: (d) => humanize(d.method) },
    { key: "period", header: "Period", render: (d) => `${formatDate(d.period_start)} – ${formatDate(d.period_end)}` },
  ];

  return (
    <div>
      <PageHeader title="Benefits" subtitle="Eligibility & disbursement" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Eligible Citizens" value={eligible.length} icon={<Users />} accent="municipality" />
        <StatCard label="Disbursements" value={disbursements.length} icon={<HandCoins />} accent="municipality" />
        <StatCard label="Total Disbursed" value={formatNpr(totalDisbursed)} icon={<HandCoins />} accent="municipality" />
      </div>

      <Tabs
        tabs={[
          { key: "eligible", label: "Eligible citizens" },
          { key: "history", label: "Disbursement history" },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-4"
      />

      {tab === "eligible" ? (
        <Card>
          <CardHeader
            title="Eligible citizens"
            action={
              <div className="w-56">
                <Select
                  placeholder="All benefits"
                  options={optionsFromEnum([
                    "UNEMPLOYMENT_ID",
                    "DISABILITY_ID",
                    "SENIOR_CITIZEN",
                    "SINGLE_WOMAN",
                    "FOOD_SUBSIDY",
                    "HEALTH_INSURANCE",
                  ])}
                  value={benefitFilter}
                  onChange={(e) => setBenefitFilter(e.target.value)}
                />
              </div>
            }
          />
          <Table columns={eligColumns} rows={eligible} rowKey={(r) => r.citizen.id} empty="No eligible citizens." />
        </Card>
      ) : (
        <Card>
          <CardHeader title="Disbursement history" />
          <Table columns={disbColumns} rows={disbursements} rowKey={(d) => d.id} empty="No disbursements recorded yet." />
        </Card>
      )}

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={`Disburse — ${target?.citizen.name_en}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button onClick={disburse}>Record disbursement</Button>
          </>
        }
      >
        {target && (
          <div className="space-y-3">
            <Select
              label="Benefit type"
              options={target.benefits.map((b) => ({ value: b.benefit_type, label: humanize(b.benefit_type) }))}
              value={benefitType}
              onChange={(e) => setBenefitType(e.target.value)}
            />
            <Input label="Amount (NPR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Select
              label="Method"
              options={optionsFromEnum(["CASH", "BANK_TRANSFER", "CHEQUE", "MOBILE_WALLET"])}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
