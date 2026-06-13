"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
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
  Textarea,
  EmptyState,
  useToast,
} from "@/components/ui";
import type { GrievanceStatus } from "@/types";
import { cn } from "@/lib/utils";
import { daysSince, daysUntil, formatDateTime, humanize } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function GrievanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { session } = useAuth();
  const { toast } = useToast();
  const [grievances] = useStore(store.grievances);
  const g = grievances.find((x) => x.id === id);

  const [modal, setModal] = useState<null | "resolve" | "refer">(null);
  const [note, setNote] = useState("");

  if (!g) {
    return (
      <div>
        <Link href="/ward/grievances" className="text-sm text-navy-700 hover:underline">← Back</Link>
        <EmptyState title="Grievance not found" />
      </div>
    );
  }

  function transition(status: GrievanceStatus, noteText: string) {
    const all = store.grievances();
    store.setGrievances(
      all.map((x) =>
        x.id === g!.id
          ? {
              ...x,
              status,
              timeline: [
                ...x.timeline,
                { status, at: new Date().toISOString(), actor: session?.full_name ?? "Ward Admin", note: noteText },
              ],
            }
          : x
      )
    );
  }

  const slaDays = daysUntil(g.sla_due);
  const breached = slaDays < 0 && g.status !== "RESOLVED_WARD" && g.status !== "CLOSED";

  return (
    <div>
      <Link href="/ward/grievances" className="mb-3 inline-flex items-center gap-1 text-sm text-navy-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to grievances
      </Link>

      <PageHeader
        title={g.tracking_code}
        subtitle={`${g.citizen_name} · ${wardLabel(g.ward_id)}`}
        action={<Badge status={g.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Details" />
            <CardBody className="space-y-3 text-sm">
              <Row label="Category" value={humanize(g.category)} />
              <Row label="Citizen" value={g.citizen_name} />
              <Row label="Filed" value={formatDateTime(g.filed_at)} />
              <div>
                <p className="text-slate-500">Description</p>
                <p className="mt-1 text-slate-700">{g.description}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity timeline" />
            <CardBody className="space-y-4">
              {g.timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-ward" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge status={t.status} />
                      <span className="text-xs text-slate-400">{formatDateTime(t.at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {t.note} <span className="text-slate-400">— {t.actor}</span>
                    </p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card accent={breached ? "central" : "ward"}>
            <CardHeader title="SLA" />
            <CardBody>
              <p className={cn("text-2xl font-bold", breached ? "text-red-600" : "text-green-600")}>
                {breached ? `${Math.abs(slaDays)}d overdue` : `${Math.max(0, slaDays)}d left`}
              </p>
              <p className="text-xs text-slate-400">
                {daysSince(g.filed_at)} days since filing · 15-day SLA
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Actions" />
            <CardBody className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={g.status !== "RECEIVED"}
                onClick={() => { transition("IN_PROGRESS", "Marked in progress"); toast("Marked in progress"); }}
              >
                Mark In Progress
              </Button>
              <Button
                className="w-full"
                disabled={g.status === "RESOLVED_WARD" || g.status === "CLOSED"}
                onClick={() => { setNote(""); setModal("resolve"); }}
              >
                Resolve at Ward Level
              </Button>
              <Button
                variant="danger"
                className="w-full"
                disabled={g.status === "REFERRED_JUDICIAL" || g.status === "CLOSED"}
                onClick={() => { setNote(""); setModal("refer"); }}
              >
                Refer to Judicial Committee
              </Button>
              <Link
                href={`/verify/grievance/${g.tracking_code}`}
                className="block pt-1 text-center text-xs text-navy-700 hover:underline"
              >
                Public tracking page →
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "resolve" ? "Resolve at Ward Level" : "Refer to Judicial Committee"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button
              disabled={!note}
              onClick={() => {
                if (modal === "resolve") { transition("RESOLVED_WARD", note); toast("Grievance resolved", "success"); }
                else { transition("REFERRED_JUDICIAL", note); toast("Referred to judicial committee", "success"); }
                setModal(null);
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <Textarea
          label={modal === "resolve" ? "Resolution details" : "Reason for referral"}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
