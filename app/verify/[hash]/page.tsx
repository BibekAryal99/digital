"use client";

import { use } from "react";
import { idCardsSeed, wardLabel } from "@/lib/data";
import { Card, Badge } from "@/components/ui";
import { formatDate, humanize, daysUntil } from "@/lib/utils";
import CheckCircle2 from "@mui/icons-material/CheckCircle";
import XCircle from "@mui/icons-material/Cancel";

export default function VerifyCardPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = use(params);
  const card = idCardsSeed.find((c) => c.qr_hash === hash);
  const valid =
    !!card &&
    (card.status === "APPROVED" || card.status === "COLLECTED") &&
    (!card.expiry_date || daysUntil(card.expiry_date) > 0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <div className="text-3xl">🇳🇵</div>
          <h1 className="text-lg font-bold text-navy-700">
            Digital Nepal — Card Verification
          </h1>
          <p className="text-xs text-slate-500">Public verification portal</p>
        </div>
        <Card className="p-6 text-center">
          {!card ? (
            <>
              <XCircle className="mx-auto h-14 w-14 text-red-500" />
              <p className="mt-3 font-semibold text-slate-800">
                Invalid or unknown card
              </p>
              <p className="text-sm text-slate-500">QR hash: {hash}</p>
            </>
          ) : (
            <>
              {valid ? (
                <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
              ) : (
                <XCircle className="mx-auto h-14 w-14 text-red-500" />
              )}
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {valid ? "Valid card" : "Card not currently valid"}
              </p>
              <div className="mt-4 space-y-2 text-left text-sm">
                <Row label="Holder" value={card.citizen_name} />
                <Row label="Card type" value={humanize(card.card_type)} />
                <Row label="Jurisdiction" value={wardLabel(card.ward_id)} />
                <Row label="Issued" value={formatDate(card.issued_date)} />
                <Row label="Expires" value={formatDate(card.expiry_date)} />
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <Badge status={card.status} />
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
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
