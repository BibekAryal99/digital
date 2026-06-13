"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import {
  PageHeader,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  useToast,
} from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import type { User } from "@/types";
import { formatDateTime, generateTempPassword } from "@/lib/utils";

export default function ProvinceAdminsPage() {
  const { toast } = useToast();
  const [users] = useStore(store.users);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState("");

  const admins = useMemo(
    () => users.filter((u) => u.role === "PROVINCE_ADMIN"),
    [users]
  );

  function toggleActive(u: User) {
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

  const columns: Column<User>[] = [
    { key: "full_name", header: "Name", sortValue: (u) => u.full_name },
    { key: "username", header: "Username", render: (u) => <span className="font-mono text-xs">{u.username}</span> },
    { key: "jurisdiction_name", header: "Province", sortValue: (u) => u.jurisdiction_name },
    { key: "last_login", header: "Last login", render: (u) => formatDateTime(u.last_login) },
    { key: "status", header: "Status", render: (u) => <Badge tone={u.is_active ? "green" : "gray"}>{u.is_active ? "Active" : "Disabled"}</Badge> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => doReset(u)}>Reset password</Button>
          <Button size="sm" variant={u.is_active ? "danger" : "primary"} onClick={() => toggleActive(u)}>
            {u.is_active ? "Disable" : "Enable"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Province Admins" subtitle="Manage province administrator accounts" />
      <Card>
        <Table columns={columns} rows={admins} rowKey={(u) => u.id} empty="No province admins." />
      </Card>

      <Modal
        open={resetUser !== null}
        onClose={() => setResetUser(null)}
        title="Password reset"
        footer={<Button onClick={() => setResetUser(null)}>Done</Button>}
      >
        {resetUser && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Temporary password for <strong>{resetUser.full_name}</strong>:
            </p>
            <div className="rounded-lg bg-slate-900 px-4 py-3 text-center font-mono text-lg text-white">
              {tempPassword}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
