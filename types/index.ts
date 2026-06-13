// ===== Shared enums / unions =====
export type Tier = "WARD" | "MUNICIPALITY" | "PROVINCE" | "CENTRAL";

export type Role =
  | "WARD_ADMIN"
  | "LOCAL_BODY_ADMIN"
  | "PROVINCE_ADMIN"
  | "CENTRAL_ADMIN"
  | "SYSTEM_ADMIN";

export type SyncStatus = "synced" | "pending" | "conflict" | "failed";

export type Sex = "MALE" | "FEMALE" | "OTHER";

export type EmploymentCategory =
  | "FARMER"
  | "UNEMPLOYED"
  | "FOREIGN_ABROAD"
  | "GOVERNMENT"
  | "STUDENT"
  | "PRIVATE_SECTOR"
  | "SELF_EMPLOYED"
  | "DAILY_WAGE"
  | "RETIRED"
  | "HOMEMAKER";

export type IncomeBand =
  | "UNDER_5K"
  | "5K_10K"
  | "10K_25K"
  | "25K_50K"
  | "50K_100K"
  | "OVER_100K";

export type ConsentChannel = "WARD_OFFICE" | "FIELD" | "VERBAL_WITNESS";

// ===== User =====
export interface User {
  id: string;
  username: string;
  password: string; // plain for mock only
  role: Role;
  full_name: string;
  phone?: string;
  jurisdiction_id: string; // ward / municipality / province id
  jurisdiction_name: string;
  is_active: boolean;
  last_login: string | null;
  failed_logins: number;
  locked_until: string | null;
  password_changed_at: string;
  created_at: string;
}

// ===== Ward / jurisdiction =====
export interface Ward {
  id: string;
  ward_no: number;
  name_en: string;
  name_np: string;
  municipality_id: string;
  municipality_name: string;
  province_id: string;
  province_name: string;
}

export interface Province {
  id: string;
  name: string;
  lat: number;
  lng: number;
  municipalities: number;
  total_citizens: number;
  top_employment: EmploymentCategory;
}

// ===== Citizen modules =====
export interface FamilyMember {
  relation: "FATHER" | "MOTHER" | "SPOUSE" | "CHILD";
  name: string;
  citizenship_no?: string;
  link_status: "pending" | "linked";
}

export interface EmploymentProfile {
  citizen_id: string;
  category: EmploymentCategory;
  income_band: IncomeBand;
  details: Record<string, string | number | boolean>;
}

export interface DisabilityProfile {
  citizen_id: string;
  disability_type:
    | "PHYSICAL"
    | "SENSORY"
    | "INTELLECTUAL"
    | "MENTAL"
    | "MULTIPLE";
  severity_body: number; // 0-4 WHO ICF
  severity_activity: number;
  severity_participation: number;
  certificate_no: string;
  issuing_hospital: string;
  expiry_date: string;
}

export interface EducationProfile {
  level:
    | "NO_FORMAL"
    | "PRIMARY"
    | "SECONDARY"
    | "HIGHER_SECONDARY"
    | "BACHELOR"
    | "MASTER"
    | "PHD";
  institution_name: string;
  institution_type: "PUBLIC" | "PRIVATE" | "COMMUNITY";
  study_location: "NEPAL" | "ABROAD";
  is_dropout: boolean;
  dropout_reason?: string;
  scholarship?: { type: string; provider: string } | null;
}

export interface HouseholdProfile {
  id: string;
  house_type: string;
  construction_type: string;
  room_count: number;
  electricity_source: string;
  water_source: string;
  sanitation: string;
  internet_access: boolean;
  bank_account: boolean;
  monthly_income_band: IncomeBand;
  poverty_class: "BELOW" | "NEAR" | "ABOVE";
}

export interface Citizen {
  id: string;
  ward_id: string;
  name_np: string;
  name_en: string;
  nid_masked: string;
  nid_verified: boolean;
  sex: Sex;
  dob: string;
  blood_group?: string;
  religion?: string;
  ethnicity?: string;
  mother_tongue?: string;
  tole: string;
  digital_literacy?: "NONE" | "BASIC" | "INTERMEDIATE" | "ADVANCED";
  has_smartphone?: boolean;
  sync_status: SyncStatus;
  is_active: boolean;
  employment_category: EmploymentCategory;
  income_band?: IncomeBand;
  consent_channel: ConsentChannel;
  consent_recorded_at?: string;
  created_at: string;
  family?: FamilyMember[];
  employment?: EmploymentProfile;
  disability?: DisabilityProfile | null;
  education?: EducationProfile;
  household?: HouseholdProfile;
  gps?: { lat: number; lng: number };
}

// ===== ID Cards =====
export type IdCardStatus =
  | "INITIATED"
  | "PENDING_APPROVAL"
  | "PDF_GENERATION"
  | "QR_SIGNED"
  | "SMS_PENDING"
  | "APPROVED"
  | "COLLECTED"
  | "EXPIRED"
  | "REVOKED";

export type CardType =
  | "UNEMPLOYMENT"
  | "DISABILITY"
  | "SENIOR"
  | "SINGLE_WOMAN"
  | "FARMER";

export interface IdCard {
  id: string;
  citizen_id: string;
  citizen_name: string;
  ward_id: string;
  card_type: CardType;
  status: IdCardStatus;
  qr_hash: string;
  issued_date: string | null;
  expiry_date: string | null;
  collected_at: string | null;
  history: { state: IdCardStatus; at: string; note?: string }[];
}

// ===== Grievances =====
export type GrievanceStatus =
  | "RECEIVED"
  | "IN_PROGRESS"
  | "RESOLVED_WARD"
  | "REFERRED_JUDICIAL"
  | "CLOSED";

export type GrievanceCategory =
  | "DATA_INACCURACY"
  | "BENEFIT_DENIAL"
  | "ID_CARD_ISSUE"
  | "PRIVACY_VIOLATION"
  | "SYSTEM_ACCESS"
  | "OTHER";

export interface Grievance {
  id: string;
  tracking_code: string;
  citizen_id: string;
  citizen_name: string;
  ward_id: string;
  category: GrievanceCategory;
  description: string;
  status: GrievanceStatus;
  filed_at: string;
  sla_due: string;
  timeline: { status: GrievanceStatus; at: string; actor: string; note?: string }[];
}

// ===== Edit approvals =====
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CAO_REVIEW";

export interface EditApproval {
  id: string;
  citizen_id: string;
  citizen_name: string;
  ward_id: string;
  submitted_by: string;
  submitter_id: string;
  submitted_at: string;
  reason: string;
  status: ApprovalStatus;
  changes: { field: string; old_value: string; new_value: string }[];
  escalated_at?: string | null;
  decision_note?: string;
}

// ===== Sync =====
export interface SyncBatch {
  id: string;
  ward_id: string;
  device_id: string;
  submitted_at: string;
  record_count: number;
  conflict_count: number;
  failed_count: number;
  status: SyncStatus;
  records: { citizen_id: string; citizen_name: string; sync_status: SyncStatus }[];
  conflicts?: SyncConflict[];
}

export interface SyncConflict {
  id: string;
  citizen_id: string;
  citizen_name: string;
  ward_id: string;
  device_id: string;
  resolution_status: "PENDING_REVIEW" | "MERGED" | "OVERWRITTEN";
  created_at: string;
  fields: { field: string; server_value: string; device_value: string }[];
}

// ===== Eligibility / benefits =====
export type BenefitType =
  | "UNEMPLOYMENT_ID"
  | "DISABILITY_ID"
  | "SENIOR_CITIZEN"
  | "SINGLE_WOMAN"
  | "FOOD_SUBSIDY"
  | "HEALTH_INSURANCE";

export interface EligibilityRule {
  id: string;
  rule_name: string;
  benefit_type: BenefitType;
  condition_summary: string;
  condition_expression: string;
  benefit_value: string;
  priority: number;
  is_active: boolean;
  affected_count: number;
  created_at: string;
  history: { at: string; by: string; action: string }[];
}

// ===== Audit / events =====
export type AuditEventType =
  | "REGISTERED"
  | "UPDATED"
  | "APPROVED"
  | "REJECTED"
  | "CONFLICT_RESOLVED"
  | "ID_CARD_ISSUED"
  | "DATA_PURGED"
  | "PASSWORD_RESET";

export interface AuditEvent {
  id: string;
  event_type: AuditEventType;
  citizen_id_masked: string;
  acted_by_role: Role;
  jurisdiction: string;
  timestamp: string;
}

// ===== Central: policy + anomaly =====
export type PolicyStatus =
  | "PENDING_REVIEW"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DISMISSED";

export interface PolicyCard {
  id: string;
  title: string;
  category:
    | "EMPLOYMENT"
    | "HEALTH"
    | "EDUCATION"
    | "INFRASTRUCTURE"
    | "BENEFITS"
    | "DISASTER";
  description: string;
  suggested_action: string;
  suggested_deadline: string;
  province: string;
  status: PolicyStatus;
}

// ===== Foreign employment =====
export interface ForeignEmployment {
  citizen_id: string;
  citizen_name: string;
  ward_id: string;
  country: string;
  visa_type: string;
  employer_name: string;
  departure_date: string;
  expected_return: string;
  remittance_band: IncomeBand;
  doe_registered: boolean;
}
