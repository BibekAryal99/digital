"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wardLabel } from "@/lib/data";
import {
  StatCard,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  PageHeader,
} from "@/components/ui";
import Users from "@mui/icons-material/People";
import BadgeCheck from "@mui/icons-material/Verified";
import RefreshCw from "@mui/icons-material/Sync";
import IdCard from "@mui/icons-material/Badge";
import UserPlus from "@mui/icons-material/PersonAdd";
import { formatDateTime } from "@/lib/utils";

export default function WardDashboard() {
  const { session } = useAuth();
  const wardId = session?.jurisdiction_id ?? "ward-004";
  const [citizens] = useStore(store.citizens);
  const [idcards] = useStore(store.idcards);
  const [batches] = useStore(store.batches);

  const wardCitizens = citizens.filter((c) => c.ward_id === wardId);
  const verified = wardCitizens.filter((c) => c.nid_verified).length;
  const pendingSync = wardCitizens.filter((c) => c.sync_status !== "synced").length;
  const cardsIssued = idcards.filter(
    (c) => c.ward_id === wardId && (c.status === "APPROVED" || c.status === "COLLECTED")
  ).length;

  const recentBatches = batches
    .filter((b) => b.ward_id === wardId)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Ward Dashboard"
        subtitle={wardLabel(wardId)}
        action={
          <Link href="/ward/citizens/new">
            <Button>
              <UserPlus className="h-4 w-4" /> Register Citizen
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Citizens"
          value={wardCitizens.length}
          icon={<Users />}
          accent="ward"
        />
        <StatCard
          label="NID Verified"
          value={verified}
          icon={<BadgeCheck />}
          accent="ward"
          change={{
            value: `${Math.round((verified / Math.max(1, wardCitizens.length)) * 100)}% verified`,
            positive: true,
          }}
        />
        <StatCard
          label="Pending Sync"
          value={pendingSync}
          icon={<RefreshCw />}
          accent="ward"
        />
        <StatCard
          label="ID Cards Issued"
          value={cardsIssued}
          icon={<IdCard />}
          accent="ward"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent sync batches"
            action={
              <Link href="/ward/sync" className="text-sm text-navy-700 hover:underline">
                View all
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {recentBatches.length === 0 && (
              <p className="text-sm text-slate-400">No sync batches yet.</p>
            )}
            {recentBatches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {b.record_count} records · {b.device_id}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(b.submitted_at)}
                  </p>
                </div>
                <Badge status={b.status} />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick actions" />
          <CardBody className="grid grid-cols-2 gap-3">
            <QuickLink href="/ward/citizens" label="Citizen List" icon={<Users className="h-5 w-5" />} />
            <QuickLink href="/ward/citizens/new" label="Register Citizen" icon={<UserPlus className="h-5 w-5" />} />
            <QuickLink href="/ward/id-cards" label="ID Cards" icon={<IdCard className="h-5 w-5" />} />
            <QuickLink href="/ward/sync" label="Sync Status" icon={<RefreshCw className="h-5 w-5" />} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-ward hover:bg-ward-light"
    >
      <span className="text-ward">{icon}</span>
      {label}
    </Link>
  );
}
