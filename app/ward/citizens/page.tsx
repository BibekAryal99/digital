"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wardLabel } from "@/lib/data";
import {
  PageHeader,
  Card,
  Table,
  Badge,
  Button,
  Input,
  Select,
  optionsFromEnum,
  Avatar,
  Pagination,
} from "@/components/ui";
import type { Citizen } from "@/types";
import type { Column as Col } from "@/components/ui/Table";
import { humanize, ageFromDob } from "@/lib/utils";
import { Search, UserPlus } from "lucide-react";

const EMP_CATS = [
  "FARMER",
  "UNEMPLOYED",
  "FOREIGN_ABROAD",
  "GOVERNMENT",
  "STUDENT",
  "PRIVATE_SECTOR",
  "SELF_EMPLOYED",
  "DAILY_WAGE",
  "RETIRED",
  "HOMEMAKER",
];

export default function CitizensPage() {
  const { session } = useAuth();
  const router = useRouter();
  const wardId = session?.jurisdiction_id ?? "ward-004";
  const [citizens] = useStore(store.citizens);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sync, setSync] = useState("");
  const [sex, setSex] = useState("");
  const [verified, setVerified] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return citizens
      .filter((c) => c.ward_id === wardId)
      .filter((c) => {
        if (q) {
          const t = q.toLowerCase();
          const match =
            c.name_en.toLowerCase().includes(t) ||
            c.name_np.includes(q) ||
            c.nid_masked.includes(q.replace(/\D/g, ""));
          if (!match) return false;
        }
        if (cat && c.employment_category !== cat) return false;
        if (sync && c.sync_status !== sync) return false;
        if (sex && c.sex !== sex) return false;
        if (verified && String(c.nid_verified) !== verified) return false;
        return true;
      });
  }, [citizens, wardId, q, cat, sync, sex, verified]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Col<Citizen>[] = [
    {
      key: "name",
      header: "Citizen",
      sortValue: (c) => c.name_en,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar nameNp={c.name_np} size="sm" />
          <div>
            <p className="font-medium text-slate-800">{c.name_en}</p>
            <p className="text-xs text-slate-400">{c.name_np}</p>
          </div>
        </div>
      ),
    },
    { key: "nid", header: "NID", render: (c) => <span className="font-mono">{c.nid_masked}</span> },
    {
      key: "nid_verified",
      header: "Verified",
      render: (c) =>
        c.nid_verified ? <Badge status="VERIFIED">Verified</Badge> : <Badge tone="gray">Unverified</Badge>,
    },
    { key: "sex", header: "Sex", render: (c) => humanize(c.sex) },
    { key: "age", header: "Age", sortValue: (c) => ageFromDob(c.dob), render: (c) => ageFromDob(c.dob) },
    {
      key: "employment_category",
      header: "Employment",
      render: (c) => humanize(c.employment_category),
    },
    { key: "sync", header: "Sync", render: (c) => <Badge status={c.sync_status} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <Link
          href={`/ward/citizens/${c.id}`}
          className="text-sm font-medium text-navy-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Citizens"
        subtitle={wardLabel(wardId)}
        action={
          <Link href="/ward/citizens/new">
            <Button>
              <UserPlus className="h-4 w-4" /> Register Citizen
            </Button>
          </Link>
        }
      />

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Search name (EN/NP) or NID last 4"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Select
            placeholder="All employment"
            options={optionsFromEnum(EMP_CATS)}
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              setPage(1);
            }}
          />
          <Select
            placeholder="All sync status"
            options={optionsFromEnum(["synced", "pending", "conflict", "failed"])}
            value={sync}
            onChange={(e) => setSync(e.target.value)}
          />
          <Select
            placeholder="All sexes"
            options={optionsFromEnum(["MALE", "FEMALE", "OTHER"])}
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          />
          <Select
            placeholder="NID: any"
            options={[
              { value: "true", label: "Verified" },
              { value: "false", label: "Unverified" },
            ]}
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          rows={paged}
          rowKey={(c) => c.id}
          onRowClick={(c) => router.push(`/ward/citizens/${c.id}`)}
          empty="No citizens match your filters."
        />
        <div className="px-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}
