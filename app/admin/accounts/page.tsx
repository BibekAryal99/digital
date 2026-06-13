"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import { wards, provinces } from "@/lib/data";
import {
  PageHeader,
  Card,
  Table,
  Badge,
  Button,
  Select,
  Input,
  Modal,
  StatCard,
  optionsFromEnum,
  useToast,
} from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import type { Role, User } from "@/types";
import { formatDateTime, generateTempPassword, humanize } from "@/lib/utils";
import { UserPlus, Users, ShieldCheck, ShieldX } from "lucide-react";

const ROLES = ["WARD_ADMIN", "LOCAL_BODY_ADMIN", "PROVINCE_ADMIN", "CENTRAL_ADMIN"];

interface Jurisdiction {
  id: string;
  name: string;
}

function jurisdictionsFor(role: string): Jurisdiction[] {
  switch (role) {
    case "WARD_ADMIN":
      return wards.map((w) => ({ id: w.id, name: `Ward ${w.ward_no} — ${w.name_en}` }));
    case "LOCAL_BODY_ADMIN": {
      const map = new Map<string, string>();
      wards.forEach((w) => map.set(w.municipality_id, w.municipality_name));
      return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }
    case "PROVINCE_ADMIN":
      return provinces.map((p) => ({ id: p.id, name: `${p.name} Province` }));
    case "CENTRAL_ADMIN":
      return [{ id: "central", name: "Government of Nepal — Central" }];
    default:
      return [];
  }
}

export default function AccountsPage() {
  const { toast } = useToast();
  const [users] = useStore(store.users);

  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState("");

  const [role, setRole] = useState("WARD_ADMIN");
  const [jurisdictionId, setJurisdictionId] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const rows = useMemo(
    () =>
      users
        .filter((u) => (roleFilter ? u.role === roleFilter : true))
        .filter((u) =>
          statusFilter === "active" ? u.is_active : statusFilter === "disabled" ? !u.is_active : true
        )
        .filter((u) =>
          search ? u.full_name.toLowerCase().includes(search.toLowerCase()) || u.username.includes(search) : true
        ),
    [users, roleFilter, statusFilter, search]
  );

  const jurisdictions = useMemo(() => jurisdictionsFor(role), [role]);

  function toggleActive(u: User) {
    if (u.role === "SYSTEM_ADMIN") {
      toast("Cannot disable the system administrator", "error");
      return;
    }
    store.setUsers(store.users().map((x) => (x.id === u.id ? { ...x, is_active: !x.is_active } : x)));
    toast(u.is_active ? "Account disabled" : "Account enabled", "success");
  }

  function doReset(u: User) {
    const pwd = generateTempPassword();
    store.setUsers(
      store.users().map((x) =>
        x.id === u.id
          ? { ...x, password: pwd, failed_logins: 0, locked_until: null, password_changed_at: new Date().toISOString() }
          : x
      )
    );
    setResetUser(u);
    setTempPassword(pwd);
  }

  function createAccount() {
    if (!fullName || !username || !jurisdictionId) {
      toast("All fields are required", "error");
      return;
    }
    if (store.users().some((u) => u.username === username)) {
      toast("Username already exists", "error");
      return;
    }
    const j = jurisdictions.find((x) => x.id === jurisdictionId)!;
    const pwd = generateTempPassword();
    const user: User = {
      id: `usr-${Date.now()}`,
      username,
      password: pwd,
      role: role as Role,
      full_name: fullName,
      jurisdiction_id: jurisdictionId,
      jurisdiction_name: j.name,
      is_active: true,
      last_login: null,
      failed_logins: 0,
      locked_until: null,
      password_changed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    store.setUsers([user, ...store.users()]);
    setOpen(false);
    setFullName(""); setUsername(""); setJurisdictionId("");
    setResetUser(user);
    setTempPassword(pwd);
    toast("Account created", "success");
  }

  const columns: Column<User>[] = [
    { key: "full_name", header: "Name", sortValue: (u) => u.full_name },
    { key: "username", header: "Username", render: (u) => <span className="font-mono text-xs">{u.username}</span> },
    { key: "role", header: "Role", render: (u) => <Badge tone="blue">{humanize(u.role)}</Badge> },
    { key: "jurisdiction_name", header: "Jurisdiction", sortValue: (u) => u.jurisdiction_name },
    { key: "last_login", header: "Last login", render: (u) => formatDateTime(u.last_login) },
    { key: "status", header: "Status", render: (u) => <Badge tone={u.is_active ? "green" : "gray"}>{u.is_active ? "Active" : "Disabled"}</Badge> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => doReset(u)}>Reset</Button>
          {u.role !== "SYSTEM_ADMIN" && (
            <Button size="sm" variant={u.is_active ? "danger" : "primary"} onClick={() => toggleActive(u)}>
              {u.is_active ? "Disable" : "Enable"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const activeCount = users.filter((u) => u.is_active).length;

  return (
    <div>
      <PageHeader
        title="Account Management"
        subtitle="All system accounts across tiers"
        action={<Button onClick={() => { setRole("WARD_ADMIN"); setJurisdictionId(""); setOpen(true); }}><UserPlus className="h-4 w-4" /> Create Account</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Accounts" value={users.length} icon={<Users />} accent="navy" />
        <StatCard label="Active" value={activeCount} icon={<ShieldCheck />} accent="navy" />
        <StatCard label="Disabled" value={users.length - activeCount} icon={<ShieldX />} accent="navy" />
      </div>

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select placeholder="All roles" options={optionsFromEnum([...ROLES, "SYSTEM_ADMIN"])} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} />
          <Select placeholder="All statuses" options={[{ value: "active", label: "Active" }, { value: "disabled", label: "Disabled" }]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
          <Input placeholder="Search name or username…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card>
        <Table columns={columns} rows={rows} rowKey={(u) => u.id} empty="No accounts match." />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={createAccount}>Create</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Role"
            options={optionsFromEnum(ROLES)}
            value={role}
            onChange={(e) => { setRole(e.target.value); setJurisdictionId(""); }}
          />
          <Select
            label="Jurisdiction"
            placeholder="Select jurisdiction"
            options={jurisdictions.map((j) => ({ value: j.id, label: j.name }))}
            value={jurisdictionId}
            onChange={(e) => setJurisdictionId(e.target.value)}
          />
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "."))} />
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            A temporary password will be generated and shown after creation.
          </p>
        </div>
      </Modal>

      <Modal
        open={resetUser !== null}
        onClose={() => setResetUser(null)}
        title="Temporary password"
        footer={<Button onClick={() => setResetUser(null)}>Done</Button>}
      >
        {resetUser && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Credentials for <strong>{resetUser.full_name}</strong> ({resetUser.username}):
            </p>
            <div className="rounded-lg bg-slate-900 px-4 py-3 text-center font-mono text-lg text-white">
              {tempPassword}
            </div>
            <p className="text-xs text-slate-400">Share securely. User must change on first login.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
