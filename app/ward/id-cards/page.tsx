"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import {
  PageHeader,
  Card,
  Table,
  Badge,
  Button,
  Select,
  Modal,
  optionsFromEnum,
  useToast,
} from "@/components/ui";
import type { IdCard, CardType } from "@/types";
import type { Column } from "@/components/ui/Table";
import { formatDate, humanize } from "@/lib/utils";
import Plus from "@mui/icons-material/Add";

const CARD_TYPES = ["UNEMPLOYMENT", "DISABILITY", "SENIOR", "SINGLE_WOMAN", "FARMER"];
const STATUSES = ["INITIATED", "PENDING_APPROVAL", "APPROVED", "COLLECTED", "EXPIRED", "REVOKED"];

export default function IdCardsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const wardId = session?.jurisdiction_id ?? "ward-004";
  const [idcards] = useStore(store.idcards);
  const [citizens] = useStore(store.citizens);

  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [newCitizen, setNewCitizen] = useState("");
  const [newType, setNewType] = useState("UNEMPLOYMENT");

  const rows = useMemo(
    () =>
      idcards
        .filter((c) => c.ward_id === wardId)
        .filter((c) => (type ? c.card_type === type : true))
        .filter((c) => (status ? c.status === status : true)),
    [idcards, wardId, type, status]
  );

  const wardCitizens = citizens.filter((c) => c.ward_id === wardId);

  function initiate() {
    if (!newCitizen) {
      toast("Select a citizen", "error");
      return;
    }
    const c = citizens.find((x) => x.id === newCitizen)!;
    const card: IdCard = {
      id: `idc-${Date.now()}`,
      citizen_id: c.id,
      citizen_name: c.name_en,
      ward_id: wardId,
      card_type: newType as CardType,
      status: "INITIATED",
      qr_hash: `QR-${Math.floor(Math.random() * 1e10)}`,
      issued_date: null,
      expiry_date: null,
      collected_at: null,
      history: [{ state: "INITIATED", at: new Date().toISOString(), note: "Card initiated" }],
    };
    store.setIdcards([card, ...store.idcards()]);
    setOpen(false);
    setNewCitizen("");
    toast("ID card initiated", "success");
    router.push(`/ward/id-cards/${card.id}`);
  }

  const columns: Column<IdCard>[] = [
    { key: "citizen_name", header: "Citizen", sortValue: (c) => c.citizen_name },
    { key: "card_type", header: "Card type", render: (c) => humanize(c.card_type) },
    { key: "status", header: "Status", render: (c) => <Badge status={c.status} /> },
    { key: "issued_date", header: "Issued", render: (c) => formatDate(c.issued_date) },
    { key: "expiry_date", header: "Expiry", render: (c) => formatDate(c.expiry_date) },
    {
      key: "actions",
      header: "",
      align: "right",
      render: () => (
        <span className="text-sm font-medium text-navy-700">View</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="ID Cards"
        subtitle="Lifecycle management"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Initiate ID Card
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select placeholder="All card types" options={optionsFromEnum(CARD_TYPES)} value={type} onChange={(e) => setType(e.target.value)} />
          <Select placeholder="All statuses" options={optionsFromEnum(STATUSES)} value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          onRowClick={(c) => router.push(`/ward/id-cards/${c.id}`)}
          empty="No ID cards found."
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Initiate ID Card"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={initiate}>Initiate</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Citizen"
            placeholder="Select citizen"
            options={wardCitizens.map((c) => ({ value: c.id, label: `${c.name_en} (${c.nid_masked})` }))}
            value={newCitizen}
            onChange={(e) => setNewCitizen(e.target.value)}
          />
          <Select
            label="Card type"
            options={optionsFromEnum(CARD_TYPES)}
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
