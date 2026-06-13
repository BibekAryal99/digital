"use client";

import dynamic from "next/dynamic";
import { provinces } from "@/lib/data";
import { PageHeader, Card, CardBody, Spinner } from "@/components/ui";
import { humanize } from "@/lib/utils";

const NationalMap = dynamic(() => import("@/components/central/NationalMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] items-center justify-center rounded-xl bg-slate-100">
      <Spinner size="lg" />
    </div>
  ),
});

export default function NationalMapPage() {
  return (
    <div>
      <PageHeader title="National Map" subtitle="Citizen distribution across 7 provinces" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden">
          <NationalMap />
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <p className="mb-2 text-sm font-semibold text-slate-600">Provinces</p>
            {provinces.map((p) => (
              <div key={p.id} className="rounded-lg border border-slate-100 p-3">
                <p className="text-sm font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-400">
                  {p.total_citizens.toLocaleString("en-IN")} citizens · {p.municipalities} municipalities
                </p>
                <p className="text-xs text-slate-400">Top: {humanize(p.top_employment)}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
