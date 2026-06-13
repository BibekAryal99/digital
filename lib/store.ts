// A tiny localStorage-backed mock store. Collections are seeded from the JSON
// files on first access and then persisted to localStorage so that mutations
// (new registrations, approvals, disbursements, account changes, etc.) survive
// navigation and reloads. Replace with real API calls when the backend lands.
"use client";

import {
  citizensSeed,
  usersSeed,
  idCardsSeed,
  grievancesSeed,
  editApprovalsSeed,
  syncBatchesSeed,
  syncConflictsSeed,
  eligibilityRulesSeed,
  policyCardsSeed,
} from "@/lib/data";
import type {
  Citizen,
  User,
  IdCard,
  Grievance,
  EditApproval,
  SyncBatch,
  SyncConflict,
  EligibilityRule,
  PolicyCard,
} from "@/types";

const PREFIX = "dn:";

export interface Disbursement {
  id: string;
  citizen_id: string;
  citizen_name: string;
  benefit_type: string;
  amount: number;
  method: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "MOBILE_WALLET";
  period_start: string;
  period_end: string;
  notes?: string;
  disbursed_by: string;
  created_at: string;
}

export interface AnomalyFlag {
  id: string;
  citizen_masked: string;
  citizen_hint: string;
  ward_id: string;
  responsible_municipality: string;
  anomaly_type:
    | "DATA_INCONSISTENCY"
    | "DUPLICATE_SUSPECTED"
    | "MISSING_CONSENT"
    | "OTHER";
  note: string;
  flagged_at: string;
  resolution_status: "OPEN" | "RESOLVED";
  resolution_note?: string;
}

export interface SystemConfig {
  access_token_ttl_h: number;
  refresh_token_ttl_d: number;
  max_concurrent_sessions: number;
  failed_attempts_lockout: number;
  lockout_duration_min: number;
  permanent_lockout_threshold: number;
  max_batch_size: number;
  sync_cleanup_days: number;
}

const SEEDS: Record<string, unknown> = {
  citizens: citizensSeed,
  users: usersSeed,
  idcards: idCardsSeed,
  grievances: grievancesSeed,
  approvals: editApprovalsSeed,
  batches: syncBatchesSeed,
  conflicts: syncConflictsSeed,
  rules: eligibilityRulesSeed,
  policies: policyCardsSeed,
  disbursements: [] as Disbursement[],
  flags: [] as AnomalyFlag[],
  config: {
    access_token_ttl_h: 8,
    refresh_token_ttl_d: 30,
    max_concurrent_sessions: 3,
    failed_attempts_lockout: 5,
    lockout_duration_min: 15,
    permanent_lockout_threshold: 10,
    max_batch_size: 50,
    sync_cleanup_days: 90,
  } as SystemConfig,
};

function read<T>(key: string): T {
  const seed = SEEDS[key] as T;
  if (typeof window === "undefined") return structuredClone(seed);
  const raw = window.localStorage.getItem(PREFIX + key);
  if (raw) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      /* fall through to seed */
    }
  }
  window.localStorage.setItem(PREFIX + key, JSON.stringify(seed));
  return structuredClone(seed);
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("dn:store-change", { detail: key }));
}

export const store = {
  citizens: () => read<Citizen[]>("citizens"),
  setCitizens: (v: Citizen[]) => write("citizens", v),
  users: () => read<User[]>("users"),
  setUsers: (v: User[]) => write("users", v),
  idcards: () => read<IdCard[]>("idcards"),
  setIdcards: (v: IdCard[]) => write("idcards", v),
  grievances: () => read<Grievance[]>("grievances"),
  setGrievances: (v: Grievance[]) => write("grievances", v),
  approvals: () => read<EditApproval[]>("approvals"),
  setApprovals: (v: EditApproval[]) => write("approvals", v),
  batches: () => read<SyncBatch[]>("batches"),
  setBatches: (v: SyncBatch[]) => write("batches", v),
  conflicts: () => read<SyncConflict[]>("conflicts"),
  setConflicts: (v: SyncConflict[]) => write("conflicts", v),
  rules: () => read<EligibilityRule[]>("rules"),
  setRules: (v: EligibilityRule[]) => write("rules", v),
  policies: () => read<PolicyCard[]>("policies"),
  setPolicies: (v: PolicyCard[]) => write("policies", v),
  disbursements: () => read<Disbursement[]>("disbursements"),
  setDisbursements: (v: Disbursement[]) => write("disbursements", v),
  flags: () => read<AnomalyFlag[]>("flags"),
  setFlags: (v: AnomalyFlag[]) => write("flags", v),
  config: () => read<SystemConfig>("config"),
  setConfig: (v: SystemConfig) => write("config", v),
  resetAll: () => {
    if (typeof window === "undefined") return;
    Object.keys(SEEDS).forEach((k) =>
      window.localStorage.removeItem(PREFIX + k)
    );
    window.dispatchEvent(new CustomEvent("dn:store-change", { detail: "all" }));
  },
};
