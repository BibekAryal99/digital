"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wards } from "@/lib/data";
import {
  PageHeader,
  Card,
  Table,
  Badge,
} from "@/components/ui";
import type { Column } from "@/components/ui/Table";

interface MuniRow {
  id: string;
  name: string;
  wards: number;
  citizens: number;
  verified: number;
  grievances: number;
  cards: number;
}

export default function MunicipalitiesPage() {
  const { session } = useAuth();
  const provId = session?.jurisdiction_id ?? "prov-koshi";
  const [citizens] = useStore(store.citizens);
  const [grievances] = useStore(store.grievances);
  const [idcards] = useStore(store.idcards);

  const rows = useMemo<MuniRow[]>(() => {
    const provWards = wards.filter((w) => w.province_id === provId);
    const map = new Map<string, string>();
    provWards.forEach((w) => map.set(w.municipality_id, w.municipality_name));
    return Array.from(map.entries()).map(([id, name]) => {
      const mWards = provWards.filter((w) => w.municipality_id === id);
      const wardIds = new Set(mWards.map((w) => w.id));
      const mCitizens = citizens.filter((c) => wardIds.has(c.ward_id));
      return {
        id,
        name,
        wards: mWards.length,
        citizens: mCitizens.length,
        verified: mCitizens.filter((c) => c.nid_verified).length,
        grievances: grievances.filter((g) => wardIds.has(g.ward_id)).length,
        cards: idcards.filter((c) => wardIds.has(c.ward_id) && (c.status === "APPROVED" || c.status === "COLLECTED")).length,
      };
    });
  }, [provId, citizens, grievances, idcards]);

  const columns: Column<MuniRow>[] = [
    { key: "name", header: "Municipality", sortValue: (r) => r.name },
    { key: "wards", header: "Wards", align: "right", sortValue: (r) => r.wards },
    { key: "citizens", header: "Citizens", align: "right", sortValue: (r) => r.citizens },
    {
      key: "verified",
      header: "NID verified",
      align: "right",
      sortValue: (r) => r.verified,
      render: (r) => (
        <span>
          {r.verified}{" "}
          <Badge tone="green">{Math.round((r.verified / Math.max(1, r.citizens)) * 100)}%</Badge>
        </span>
      ),
    },
    { key: "grievances", header: "Grievances", align: "right", sortValue: (r) => r.grievances },
    { key: "cards", header: "ID cards", align: "right", sortValue: (r) => r.cards },
  ];

  return (
    <div>
      <PageHeader title="Municipality Comparison" subtitle={session?.jurisdiction_name ?? "Koshi Province"} />
      <Card>
        <Table columns={columns} rows={rows} rowKey={(r) => r.id} empty="No municipalities." />
      </Card>
    </div>
  );
}
