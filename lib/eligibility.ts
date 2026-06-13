import type { Citizen, EligibilityRule, BenefitType } from "@/types";
import { ageFromDob } from "@/lib/utils";

export interface EligibilityResult {
  benefit_type: BenefitType;
  rule_name: string;
  reason: string;
}

function maxSeverity(c: Citizen): number {
  if (!c.disability) return 0;
  return Math.max(
    c.disability.severity_body,
    c.disability.severity_activity,
    c.disability.severity_participation
  );
}

/** Evaluate active eligibility rules against a citizen (client-side mock). */
export function evaluateEligibility(
  c: Citizen,
  rules: EligibilityRule[]
): EligibilityResult[] {
  const age = ageFromDob(c.dob);
  const out: EligibilityResult[] = [];

  for (const r of rules) {
    if (!r.is_active) continue;
    let ok = false;
    let reason = "";
    switch (r.benefit_type) {
      case "UNEMPLOYMENT_ID": {
        const dur = Number(c.employment?.details?.duration_months ?? 0);
        ok = c.employment_category === "UNEMPLOYED" && dur > 6 && age >= 18 && age <= 59;
        reason = `Unemployed for ${dur} months, age ${age}`;
        break;
      }
      case "DISABILITY_ID": {
        const sev = maxSeverity(c);
        ok = sev >= 2;
        reason = `WHO ICF max severity ${sev}`;
        break;
      }
      case "SENIOR_CITIZEN":
        ok = age >= 68;
        reason = `Age ${age}`;
        break;
      case "SINGLE_WOMAN":
        ok = c.sex === "FEMALE" && age >= 60;
        reason = `Female, age ${age}`;
        break;
      case "FOOD_SUBSIDY":
        ok = c.household?.poverty_class === "BELOW";
        reason = `Poverty class ${c.household?.poverty_class ?? "—"}`;
        break;
      case "HEALTH_INSURANCE":
        ok = c.income_band === "UNDER_5K" || c.income_band === "5K_10K";
        reason = `Income band ${c.income_band ?? "—"}`;
        break;
    }
    if (ok) out.push({ benefit_type: r.benefit_type, rule_name: r.rule_name, reason });
  }
  return out;
}
