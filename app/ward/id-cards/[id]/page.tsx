"use client";

import { use } from "react";
import Link from "next/link";
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
  EmptyState,
  useToast,
} from "@/components/ui";
import type { IdCardStatus } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime, humanize } from "@/lib/utils";
import { ArrowLeft, Check, Download } from "lucide-react";

const FLOW: IdCardStatus[] = [
  "INITIATED",
  "PENDING_APPROVAL",
  "PDF_GENERATION",
  "QR_SIGNED",
  "SMS_PENDING",
  "APPROVED",
  "COLLECTED",
];

export default function IdCardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { toast } = useToast();
  const [idcards] = useStore(store.idcards);
  const card = idcards.find((c) => c.id === id);

  if (!card) {
    return (
      <div>
        <Link href="/ward/id-cards" className="text-sm text-navy-700 hover:underline">
          ← Back
        </Link>
        <EmptyState title="ID card not found" />
      </div>
    );
  }

  const terminal = card.status === "EXPIRED" || card.status === "REVOKED";
  const currentIndex = FLOW.indexOf(card.status);

  function markCollected() {
    const cards = store.idcards();
    store.setIdcards(
      cards.map((c) =>
        c.id === card!.id
          ? {
              ...c,
              status: "COLLECTED" as IdCardStatus,
              collected_at: new Date().toISOString().slice(0, 10),
              history: [
                ...c.history,
                { state: "COLLECTED" as IdCardStatus, at: new Date().toISOString(), note: "Collected by citizen" },
              ],
            }
          : c
      )
    );
    toast("Card marked as collected", "success");
  }

  return (
    <div>
      <Link
        href="/ward/id-cards"
        className="mb-3 inline-flex items-center gap-1 text-sm text-navy-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to ID cards
      </Link>

      <PageHeader
        title={`${humanize(card.card_type)} ID Card`}
        subtitle={wardLabel(card.ward_id)}
        action={
          <div className="flex gap-2">
            {card.status === "APPROVED" && (
              <Button onClick={markCollected}>
                <Check className="h-4 w-4" /> Mark Collected
              </Button>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Card details" action={<Badge status={card.status} />} />
          <CardBody className="space-y-2 text-sm">
            <Row label="Holder" value={card.citizen_name} />
            <Row label="Card type" value={humanize(card.card_type)} />
            <Row label="QR hash" value={<span className="font-mono">{card.qr_hash.slice(0, 6)}••••</span>} />
            <Row label="Issued date" value={formatDate(card.issued_date)} />
            <Row label="Expiry date" value={formatDate(card.expiry_date)} />
            <Row label="Collected at" value={formatDate(card.collected_at)} />
            <div className="pt-2">
              <Link
                href={`/verify/${card.qr_hash}`}
                className="text-sm text-navy-700 hover:underline"
              >
                Public verification link →
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Lifecycle status" />
          <CardBody>
            {terminal ? (
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <Badge status={card.status} />
                <p className="mt-2 text-sm text-slate-500">
                  This card is {card.status.toLowerCase()}.
                </p>
              </div>
            ) : (
              <ol className="space-y-1">
                {FLOW.map((state, i) => {
                  const done = i < currentIndex;
                  const active = i === currentIndex;
                  return (
                    <li key={state} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          done && "bg-ward text-white",
                          active && "bg-navy-700 text-white ring-4 ring-navy-100",
                          !done && !active && "bg-slate-100 text-slate-400"
                        )}
                      >
                        {done ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          active ? "font-semibold text-navy-700" : done ? "text-slate-600" : "text-slate-400"
                        )}
                      >
                        {humanize(state)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="History" />
        <CardBody className="space-y-3">
          {card.history.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-navy-700" />
              <div>
                <p className="text-sm font-medium text-slate-700">{humanize(h.state)}</p>
                <p className="text-xs text-slate-400">{formatDateTime(h.at)}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
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
