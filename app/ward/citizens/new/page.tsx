"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { store } from "@/lib/store";
import { wardLabel } from "@/lib/data";
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  optionsFromEnum,
  useToast,
} from "@/components/ui";
import type { Citizen, EmploymentCategory, EducationProfile, IncomeBand } from "@/types";
import { cn } from "@/lib/utils";
import Check from "@mui/icons-material/Check";
import ShieldCheck from "@mui/icons-material/VerifiedUser";

const STEPS = [
  "Core Identity",
  "Family",
  "Employment",
  "Disability",
  "Education",
  "Household",
  "GPS",
];

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
const INCOME = ["UNDER_5K", "5K_10K", "10K_25K", "25K_50K", "50K_100K", "OVER_100K"];

type FormState = Record<string, string | boolean>;

export default function NewCitizenPage() {
  const { session } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const wardId = session?.jurisdiction_id ?? "ward-004";

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    consent_recorded_at: new Date().toISOString(),
    consent_channel: "WARD_OFFICE",
    sex: "MALE",
    employment_category: "FARMER",
    income_band: "UNDER_5K",
    nid_verified: false,
  });
  const [nidVerified, setNidVerified] = useState(false);

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function verifyNid() {
    const nid = String(form.nid ?? "").replace(/\D/g, "");
    if (nid.length === 10) {
      setNidVerified(true);
      set("nid_verified", true);
      toast("NID verified", "success");
    } else {
      toast("NID must be a 10-digit number", "error");
    }
  }

  function submit() {
    const citizens = store.citizens();
    const id = `cit-${String(citizens.length + 1).padStart(3, "0")}-${Date.now()
      .toString()
      .slice(-4)}`;
    const nid = String(form.nid ?? "").replace(/\D/g, "");
    const cat = String(form.employment_category) as EmploymentCategory;

    const citizen: Citizen = {
      id,
      ward_id: wardId,
      name_np: String(form.name_np ?? ""),
      name_en: String(form.name_en ?? ""),
      nid_masked: nid ? `****${nid.slice(-4)}` : "****0000",
      nid_verified: nidVerified,
      sex: String(form.sex) as Citizen["sex"],
      dob: String(form.dob ?? ""),
      blood_group: String(form.blood_group ?? ""),
      religion: String(form.religion ?? ""),
      ethnicity: String(form.ethnicity ?? ""),
      mother_tongue: String(form.mother_tongue ?? ""),
      tole: String(form.tole ?? ""),
      digital_literacy: (String(form.digital_literacy ?? "BASIC") as Citizen["digital_literacy"]),
      has_smartphone: Boolean(form.has_smartphone),
      sync_status: "pending",
      is_active: true,
      employment_category: cat,
      income_band: String(form.income_band) as Citizen["income_band"],
      consent_channel: String(form.consent_channel) as Citizen["consent_channel"],
      consent_recorded_at: String(form.consent_recorded_at),
      created_at: new Date().toISOString(),
      family: [
        form.father_name
          ? { relation: "FATHER" as const, name: String(form.father_name), citizenship_no: String(form.father_citizenship ?? ""), link_status: "pending" as const }
          : null,
        form.mother_name
          ? { relation: "MOTHER" as const, name: String(form.mother_name), citizenship_no: String(form.mother_citizenship ?? ""), link_status: "pending" as const }
          : null,
        form.spouse_name
          ? { relation: "SPOUSE" as const, name: String(form.spouse_name), citizenship_no: String(form.spouse_citizenship ?? ""), link_status: "pending" as const }
          : null,
      ].filter(Boolean) as Citizen["family"],
      employment: {
        citizen_id: id,
        category: cat,
        income_band: String(form.income_band) as IncomeBand,
        details: {},
      },
      disability: form.has_disability
        ? {
            citizen_id: id,
            disability_type: (String(form.disability_type ?? "PHYSICAL") as NonNullable<Citizen["disability"]>["disability_type"]),
            severity_body: Number(form.severity_body ?? 0),
            severity_activity: Number(form.severity_activity ?? 0),
            severity_participation: Number(form.severity_participation ?? 0),
            certificate_no: String(form.certificate_no ?? ""),
            issuing_hospital: String(form.issuing_hospital ?? ""),
            expiry_date: String(form.disability_expiry ?? ""),
          }
        : null,
      education: {
        level: (String(form.education_level ?? "SECONDARY") as EducationProfile["level"]),
        institution_name: String(form.institution_name ?? ""),
        institution_type: (String(form.institution_type ?? "PUBLIC") as "PUBLIC" | "PRIVATE" | "COMMUNITY"),
        study_location: (String(form.study_location ?? "NEPAL") as "NEPAL" | "ABROAD"),
        is_dropout: Boolean(form.is_dropout),
        scholarship: null,
      },
      household: {
        id: `hh-${id}`,
        house_type: String(form.house_type ?? "Own"),
        construction_type: String(form.construction_type ?? "RCC"),
        room_count: Number(form.room_count ?? 3),
        electricity_source: String(form.electricity_source ?? "National Grid"),
        water_source: String(form.water_source ?? "Piped"),
        sanitation: String(form.sanitation ?? "Flush toilet"),
        internet_access: Boolean(form.internet_access),
        bank_account: Boolean(form.bank_account),
        monthly_income_band: String(form.income_band) as IncomeBand,
        poverty_class: (String(form.poverty_class ?? "ABOVE") as "BELOW" | "NEAR" | "ABOVE"),
      },
      gps:
        form.lat && form.lng
          ? { lat: Number(form.lat), lng: Number(form.lng) }
          : undefined,
    };

    store.setCitizens([citizen, ...citizens]);
    toast("Citizen registered successfully", "success");
    router.push(`/ward/citizens/${id}`);
  }

  const canProceed =
    step !== 0 || (form.name_en && form.name_np && form.dob);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Register Citizen"
        subtitle={wardLabel(wardId)}
      />

      {/* Progress */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto scroll-thin">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <button
              onClick={() => i <= step && setStep(i)}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  i < step
                    ? "bg-ward text-white"
                    : i === step
                    ? "bg-navy-700 text-white"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  i === step ? "text-navy-700" : "text-slate-400"
                )}
              >
                {s}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="mx-2 h-px flex-1 bg-slate-200" />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardBody>
          {step === 0 && (
            <StepGrid title="Step 1 — Core Identity">
              <Input label="Full name (English)" required value={String(form.name_en ?? "")} onChange={(e) => set("name_en", e.target.value)} />
              <Input label="Full name (Nepali)" required value={String(form.name_np ?? "")} onChange={(e) => set("name_np", e.target.value)} placeholder="नेपालीमा नाम" />
              <Input label="Date of birth" type="date" required value={String(form.dob ?? "")} onChange={(e) => set("dob", e.target.value)} />
              <Select label="Sex" options={optionsFromEnum(["MALE", "FEMALE", "OTHER"])} value={String(form.sex)} onChange={(e) => set("sex", e.target.value)} />
              <Select label="Blood group" placeholder="Select" options={optionsFromEnum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])} value={String(form.blood_group ?? "")} onChange={(e) => set("blood_group", e.target.value)} />
              <Input label="Religion" value={String(form.religion ?? "")} onChange={(e) => set("religion", e.target.value)} />
              <Input label="Ethnicity" value={String(form.ethnicity ?? "")} onChange={(e) => set("ethnicity", e.target.value)} />
              <Input label="Mother tongue" value={String(form.mother_tongue ?? "")} onChange={(e) => set("mother_tongue", e.target.value)} />
              <Input label="Tole" value={String(form.tole ?? "")} onChange={(e) => set("tole", e.target.value)} />
              <Select label="Digital literacy" options={optionsFromEnum(["NONE", "BASIC", "INTERMEDIATE", "ADVANCED"])} value={String(form.digital_literacy ?? "BASIC")} onChange={(e) => set("digital_literacy", e.target.value)} />
              <div className="flex items-end gap-2">
                <Input label="National ID (NID)" value={String(form.nid ?? "")} onChange={(e) => { set("nid", e.target.value); setNidVerified(false); }} placeholder="10-digit number" />
                <Button variant="outline" type="button" onClick={verifyNid} className="mb-[1px]">
                  {nidVerified ? <><ShieldCheck className="h-4 w-4 text-green-600" /> Verified</> : "Verify NID"}
                </Button>
              </div>
              <Input label="Citizenship number" value={String(form.citizenship_no ?? "")} onChange={(e) => set("citizenship_no", e.target.value.replace(/[-/]/g, ""))} hint="Dashes/slashes are stripped automatically" />
              <div className="flex items-center gap-4 pt-6">
                <Checkbox label="Owns a smartphone" checked={Boolean(form.has_smartphone)} onChange={(e) => set("has_smartphone", e.target.checked)} />
              </div>
              <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-sm font-medium text-slate-700">Consent</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Select label="Consent channel" options={optionsFromEnum(["WARD_OFFICE", "FIELD", "VERBAL_WITNESS"])} value={String(form.consent_channel)} onChange={(e) => set("consent_channel", e.target.value)} />
                  <Input label="Consent recorded at" value={new Date(String(form.consent_recorded_at)).toLocaleString()} disabled />
                </div>
              </div>
            </StepGrid>
          )}

          {step === 1 && (
            <StepGrid title="Step 2 — Family Tree">
              <FamilyRow label="Father" form={form} set={set} prefix="father" />
              <FamilyRow label="Mother" form={form} set={set} prefix="mother" />
              <FamilyRow label="Spouse" form={form} set={set} prefix="spouse" />
              <p className="md:col-span-2 text-xs text-slate-400">
                Members are auto-linked when a matching citizenship number exists in the registry. Until then they show a <strong>pending</strong> link status.
              </p>
            </StepGrid>
          )}

          {step === 2 && (
            <StepGrid title="Step 3 — Employment">
              <Select label="Employment category" options={optionsFromEnum(EMP_CATS)} value={String(form.employment_category)} onChange={(e) => set("employment_category", e.target.value)} />
              <Select label="Income band" options={optionsFromEnum(INCOME)} value={String(form.income_band)} onChange={(e) => set("income_band", e.target.value)} />
              <EmploymentSubFields category={String(form.employment_category) as EmploymentCategory} form={form} set={set} />
            </StepGrid>
          )}

          {step === 3 && (
            <StepGrid title="Step 4 — Disability (optional)">
              <div className="md:col-span-2">
                <Checkbox label="This citizen has a registered disability" checked={Boolean(form.has_disability)} onChange={(e) => set("has_disability", e.target.checked)} />
              </div>
              {form.has_disability && (
                <>
                  <Select label="Disability type" options={optionsFromEnum(["PHYSICAL", "SENSORY", "INTELLECTUAL", "MENTAL", "MULTIPLE"])} value={String(form.disability_type ?? "PHYSICAL")} onChange={(e) => set("disability_type", e.target.value)} />
                  <Input label="Certificate number" value={String(form.certificate_no ?? "")} onChange={(e) => set("certificate_no", e.target.value)} />
                  <Input label="Issuing hospital" value={String(form.issuing_hospital ?? "")} onChange={(e) => set("issuing_hospital", e.target.value)} />
                  <Input label="Expiry date" type="date" value={String(form.disability_expiry ?? "")} onChange={(e) => set("disability_expiry", e.target.value)} />
                  <Slider label="Body function severity" value={Number(form.severity_body ?? 0)} onChange={(v) => set("severity_body", String(v))} />
                  <Slider label="Activity severity" value={Number(form.severity_activity ?? 0)} onChange={(v) => set("severity_activity", String(v))} />
                  <Slider label="Participation severity" value={Number(form.severity_participation ?? 0)} onChange={(v) => set("severity_participation", String(v))} />
                </>
              )}
            </StepGrid>
          )}

          {step === 4 && (
            <StepGrid title="Step 5 — Education">
              <Select label="Education level" options={optionsFromEnum(["NO_FORMAL", "PRIMARY", "SECONDARY", "HIGHER_SECONDARY", "BACHELOR", "MASTER", "PHD"])} value={String(form.education_level ?? "SECONDARY")} onChange={(e) => set("education_level", e.target.value)} />
              <Input label="Institution name" value={String(form.institution_name ?? "")} onChange={(e) => set("institution_name", e.target.value)} />
              <Select label="Institution type" options={optionsFromEnum(["PUBLIC", "PRIVATE", "COMMUNITY"])} value={String(form.institution_type ?? "PUBLIC")} onChange={(e) => set("institution_type", e.target.value)} />
              <Select label="Study location" options={optionsFromEnum(["NEPAL", "ABROAD"])} value={String(form.study_location ?? "NEPAL")} onChange={(e) => set("study_location", e.target.value)} />
              <div className="md:col-span-2">
                <Checkbox label="Dropped out" checked={Boolean(form.is_dropout)} onChange={(e) => set("is_dropout", e.target.checked)} />
              </div>
              {form.is_dropout && (
                <Input label="Dropout reason" value={String(form.dropout_reason ?? "")} onChange={(e) => set("dropout_reason", e.target.value)} />
              )}
            </StepGrid>
          )}

          {step === 5 && (
            <StepGrid title="Step 6 — Household">
              <Select label="House type" options={optionsFromEnum(["Own", "Rented", "Joint Family"]).map((o) => ({ value: o.label, label: o.label }))} value={String(form.house_type ?? "Own")} onChange={(e) => set("house_type", e.target.value)} />
              <Select label="Construction type" options={["RCC", "Stone-Mud", "Wooden", "Cement-Brick"].map((v) => ({ value: v, label: v }))} value={String(form.construction_type ?? "RCC")} onChange={(e) => set("construction_type", e.target.value)} />
              <Input label="Room count" type="number" value={String(form.room_count ?? 3)} onChange={(e) => set("room_count", e.target.value)} />
              <Select label="Electricity source" options={["National Grid", "Solar", "Micro-hydro"].map((v) => ({ value: v, label: v }))} value={String(form.electricity_source ?? "National Grid")} onChange={(e) => set("electricity_source", e.target.value)} />
              <Select label="Water source" options={["Piped", "Well", "Spring", "Tanker"].map((v) => ({ value: v, label: v }))} value={String(form.water_source ?? "Piped")} onChange={(e) => set("water_source", e.target.value)} />
              <Select label="Sanitation" options={["Flush toilet", "Pit latrine"].map((v) => ({ value: v, label: v }))} value={String(form.sanitation ?? "Flush toilet")} onChange={(e) => set("sanitation", e.target.value)} />
              <Select label="Poverty class" options={optionsFromEnum(["BELOW", "NEAR", "ABOVE"])} value={String(form.poverty_class ?? "ABOVE")} onChange={(e) => set("poverty_class", e.target.value)} />
              <div className="flex items-center gap-6 pt-6">
                <Checkbox label="Internet access" checked={Boolean(form.internet_access)} onChange={(e) => set("internet_access", e.target.checked)} />
                <Checkbox label="Bank account" checked={Boolean(form.bank_account)} onChange={(e) => set("bank_account", e.target.checked)} />
              </div>
            </StepGrid>
          )}

          {step === 6 && (
            <StepGrid title="Step 7 — GPS Coordinates">
              <Input label="Latitude" value={String(form.lat ?? "")} onChange={(e) => set("lat", e.target.value)} placeholder="27.1234" />
              <Input label="Longitude" value={String(form.lng ?? "")} onChange={(e) => set("lng", e.target.value)} placeholder="87.6789" />
              <div className="md:col-span-2 flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                Map preview placeholder — the mobile app captures GPS automatically
              </div>
            </StepGrid>
          )}
        </CardBody>
      </Card>

      <div className="mt-4 flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={submit}>Submit Registration</Button>
        )}
      </div>
    </div>
  );
}

function StepGrid({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function FamilyRow({
  label,
  form,
  set,
  prefix,
}: {
  label: string;
  form: FormState;
  set: (k: string, v: string) => void;
  prefix: string;
}) {
  return (
    <div className="md:col-span-2 grid grid-cols-1 gap-3 rounded-lg border border-slate-100 p-3 md:grid-cols-2">
      <Input label={`${label} name`} value={String(form[`${prefix}_name`] ?? "")} onChange={(e) => set(`${prefix}_name`, e.target.value)} />
      <Input label={`${label} citizenship no.`} value={String(form[`${prefix}_citizenship`] ?? "")} onChange={(e) => set(`${prefix}_citizenship`, e.target.value)} />
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}: <span className="font-bold">{value}</span> / 4
      </label>
      <input type="range" min={0} max={4} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-navy-700" />
    </div>
  );
}

function EmploymentSubFields({
  category,
  form,
  set,
}: {
  category: EmploymentCategory;
  form: FormState;
  set: (k: string, v: string | boolean) => void;
}) {
  if (category === "UNEMPLOYED")
    return (
      <>
        <Input label="Unemployed duration (months)" type="number" value={String(form.duration_months ?? "")} onChange={(e) => set("duration_months", e.target.value)} />
        <Input label="Skills (comma separated)" value={String(form.skills ?? "")} onChange={(e) => set("skills", e.target.value)} />
        <div className="pt-6">
          <Checkbox label="Registered at employment office" checked={Boolean(form.emp_office)} onChange={(e) => set("emp_office", e.target.checked)} />
        </div>
      </>
    );
  if (category === "FARMER")
    return (
      <>
        <Input label="Land area (Ropani)" type="number" value={String(form.land_area ?? "")} onChange={(e) => set("land_area", e.target.value)} />
        <Select label="Land type" options={["Khet", "Bari", "Mixed"].map((v) => ({ value: v, label: v }))} value={String(form.land_type ?? "Khet")} onChange={(e) => set("land_type", e.target.value)} />
        <Input label="Primary crop" value={String(form.primary_crop ?? "")} onChange={(e) => set("primary_crop", e.target.value)} />
        <Select label="Irrigation type" options={["Rain-fed", "Canal", "Tube-well"].map((v) => ({ value: v, label: v }))} value={String(form.irrigation ?? "Rain-fed")} onChange={(e) => set("irrigation", e.target.value)} />
        <div className="pt-6">
          <Checkbox label="Has agricultural loan" checked={Boolean(form.agri_loan)} onChange={(e) => set("agri_loan", e.target.checked)} />
        </div>
      </>
    );
  if (category === "FOREIGN_ABROAD")
    return (
      <>
        <Select label="Country" options={["Qatar", "Malaysia", "Saudi Arabia", "UAE", "South Korea", "Kuwait"].map((v) => ({ value: v, label: v }))} value={String(form.country ?? "Qatar")} onChange={(e) => set("country", e.target.value)} />
        <Input label="Visa type" value={String(form.visa_type ?? "")} onChange={(e) => set("visa_type", e.target.value)} />
        <Input label="Employer name" value={String(form.employer ?? "")} onChange={(e) => set("employer", e.target.value)} />
        <Input label="Departure date" type="date" value={String(form.departure ?? "")} onChange={(e) => set("departure", e.target.value)} />
        <Input label="Expected return" type="date" value={String(form.expected_return ?? "")} onChange={(e) => set("expected_return", e.target.value)} />
        <div className="pt-6">
          <Checkbox label="Registered with Dept. of Foreign Employment" checked={Boolean(form.doe)} onChange={(e) => set("doe", e.target.checked)} />
        </div>
      </>
    );
  if (category === "GOVERNMENT")
    return (
      <>
        <Input label="Ministry" value={String(form.ministry ?? "")} onChange={(e) => set("ministry", e.target.value)} />
        <Select label="Grade" options={["Gazetted", "Non-Gazetted"].map((v) => ({ value: v, label: v }))} value={String(form.grade ?? "Gazetted")} onChange={(e) => set("grade", e.target.value)} />
        <Input label="Posting district" value={String(form.posting ?? "")} onChange={(e) => set("posting", e.target.value)} />
        <Input label="Service entry year" type="number" value={String(form.entry_year ?? "")} onChange={(e) => set("entry_year", e.target.value)} />
      </>
    );
  if (category === "STUDENT")
    return (
      <>
        <Input label="Institution name" value={String(form.std_institution ?? "")} onChange={(e) => set("std_institution", e.target.value)} />
        <Input label="Level" value={String(form.std_level ?? "")} onChange={(e) => set("std_level", e.target.value)} />
        <Input label="Field of study" value={String(form.field ?? "")} onChange={(e) => set("field", e.target.value)} />
        <Select label="Location" options={["Nepal", "Abroad"].map((v) => ({ value: v, label: v }))} value={String(form.std_location ?? "Nepal")} onChange={(e) => set("std_location", e.target.value)} />
      </>
    );
  return (
    <div className="md:col-span-2">
      <Textarea label="Occupation notes" value={String(form.occupation_note ?? "")} onChange={(e) => set("occupation_note", e.target.value)} />
    </div>
  );
}
