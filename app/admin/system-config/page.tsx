"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { store } from "@/lib/store";
import type { SystemConfig } from "@/lib/store";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  useToast,
} from "@/components/ui";

const FIELDS: { key: keyof SystemConfig; label: string; hint: string }[] = [
  { key: "access_token_ttl_h", label: "Access token TTL (hours)", hint: "JWT access token lifetime" },
  { key: "refresh_token_ttl_d", label: "Refresh token TTL (days)", hint: "Refresh token lifetime" },
  { key: "max_concurrent_sessions", label: "Max concurrent sessions", hint: "Per user" },
  { key: "failed_attempts_lockout", label: "Failed attempts before lockout", hint: "Temporary lockout threshold" },
  { key: "lockout_duration_min", label: "Lockout duration (minutes)", hint: "Temporary lockout length" },
  { key: "permanent_lockout_threshold", label: "Permanent lockout threshold", hint: "Failed attempts for permanent lock" },
  { key: "max_batch_size", label: "Max sync batch size", hint: "Records per offline sync batch" },
  { key: "sync_cleanup_days", label: "Sync cleanup (days)", hint: "Retention of completed sync batches" },
];

export default function SystemConfigPage() {
  const { toast } = useToast();
  const [config] = useStore(store.config);
  const [draft, setDraft] = useState<SystemConfig>(config);

  useEffect(() => setDraft(config), [config]);

  function save() {
    store.setConfig(draft);
    toast("System configuration saved", "success");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="System Configuration" subtitle="Security & sync parameters" />

      <Card>
        <CardHeader title="Parameters" />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <Input
                key={f.key}
                label={f.label}
                hint={f.hint}
                type="number"
                value={String(draft[f.key])}
                onChange={(e) => setDraft({ ...draft, [f.key]: Number(e.target.value) })}
              />
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDraft(config)}>Reset</Button>
            <Button onClick={save}>Save configuration</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
