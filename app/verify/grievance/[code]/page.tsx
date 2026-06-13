"use client";

import { use } from "react";
import { grievancesSeed } from "@/lib/data";
import { Card, Badge } from "@/components/ui";
import { formatDateTime, humanize } from "@/lib/utils";
import { FileSearch } from "lucide-react";

export default function VerifyGrievancePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const grievance = grievancesSeed.find((g) => g.tracking_code === code);
  const last = grievance?.timeline[grievance.timeline.length - 1];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <FileSearch className="mx-auto h-10 w-10 text-navy-700" />
          <h1 className="text-lg font-bold text-navy-700">
            Grievance Status Tracker
          </h1>
          <p className="text-xs text-slate-500">
            Public — no personal information is shown
          </p>
        </div>
        <Card className="p-6">
          {!grievance ? (
            <p className="text-center text-slate-500">
              No grievance found for code <strong>{code}</strong>.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tracking code</span>
                <span className="font-mono font-medium">
                  {grievance.tracking_code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Category</span>
                <span>{humanize(grievance.category)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current status</span>
                <Badge status={grievance.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last update</span>
                <span>{formatDateTime(last?.at)}</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
