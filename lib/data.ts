// Central import point for all mock JSON data.
// When the Spring Boot API is ready, replace these imports with fetch() calls.
import citizensRaw from "@/data/citizens.json";
import usersRaw from "@/data/users.json";
import wardsRaw from "@/data/wards.json";
import provincesRaw from "@/data/provinces.json";
import idCardsRaw from "@/data/id-cards.json";
import grievancesRaw from "@/data/grievances.json";
import editApprovalsRaw from "@/data/edit-approvals.json";
import syncBatchesRaw from "@/data/sync-batches.json";
import syncConflictsRaw from "@/data/sync-conflicts.json";
import eligibilityRulesRaw from "@/data/eligibility-rules.json";
import auditLogRaw from "@/data/audit-log.json";
import policyCardsRaw from "@/data/policy-cards.json";
import foreignEmploymentRaw from "@/data/foreign-employment.json";

import type {
  Citizen,
  User,
  Ward,
  Province,
  IdCard,
  Grievance,
  EditApproval,
  SyncBatch,
  SyncConflict,
  EligibilityRule,
  AuditEvent,
  PolicyCard,
  ForeignEmployment,
} from "@/types";

export const citizensSeed = citizensRaw as unknown as Citizen[];
export const usersSeed = usersRaw as unknown as User[];
export const wards = wardsRaw as unknown as Ward[];
export const provinces = provincesRaw as unknown as Province[];
export const idCardsSeed = idCardsRaw as unknown as IdCard[];
export const grievancesSeed = grievancesRaw as unknown as Grievance[];
export const editApprovalsSeed = editApprovalsRaw as unknown as EditApproval[];
export const syncBatchesSeed = syncBatchesRaw as unknown as SyncBatch[];
export const syncConflictsSeed = syncConflictsRaw as unknown as SyncConflict[];
export const eligibilityRulesSeed =
  eligibilityRulesRaw as unknown as EligibilityRule[];
export const auditLogSeed = auditLogRaw as unknown as AuditEvent[];
export const policyCardsSeed = policyCardsRaw as unknown as PolicyCard[];
export const foreignEmploymentSeed =
  foreignEmploymentRaw as unknown as ForeignEmployment[];

export function wardById(id: string): Ward | undefined {
  return wards.find((w) => w.id === id);
}

export function wardLabel(id: string): string {
  const w = wardById(id);
  return w ? `Ward ${w.ward_no} — ${w.name_en}` : id;
}
