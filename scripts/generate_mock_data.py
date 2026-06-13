#!/usr/bin/env python3
"""Generate realistic mock JSON data for the Digital Nepal Citizen Ecosystem.

All data is fictional but realistic: real Nepali names, the 9 wards of Kummayak
Rural Municipality (Panchthar, Koshi Province), and cross-referenced records so
that citizens appearing in id-cards/grievances/approvals actually exist in
citizens.json. Output written to ../data/*.json
"""
import json
import os
import random
from datetime import datetime, timedelta

random.seed(42)
OUT = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(OUT, exist_ok=True)

NOW = datetime(2026, 6, 13, 5, 30, 0)


def iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def date(dt):
    return dt.strftime("%Y-%m-%d")


def write(name, data):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"wrote {name} ({len(data) if isinstance(data, list) else 'obj'})")


# ---------------- Wards ----------------
WARD_NAMES = [
    ("Memeng", "मेमेङ"),
    ("Kummayak", "कुम्मायक"),
    ("Nawamidanda", "नवमीडाँडा"),
    ("Bhagawati", "भगवती"),
    ("Phidim Bazar", "फिदिम बजार"),
    ("Yangnam", "याङनाम"),
    ("Sidin", "सिदिन"),
    ("Chyangthapu", "च्याङथापु"),
    ("Oyam", "ओयाम"),
]

wards = []
for i, (en, np) in enumerate(WARD_NAMES, start=1):
    wards.append(
        {
            "id": f"ward-{i:03d}",
            "ward_no": i,
            "name_en": en,
            "name_np": np,
            "municipality_id": "mun-001",
            "municipality_name": "Kummayak Rural Municipality",
            "province_id": "prov-koshi",
            "province_name": "Koshi Province",
        }
    )
write("wards.json", wards)

# ---------------- Provinces ----------------
provinces = [
    {"id": "prov-koshi", "name": "Koshi", "lat": 27.05, "lng": 87.26, "municipalities": 137, "total_citizens": 4961412, "top_employment": "FARMER"},
    {"id": "prov-madhesh", "name": "Madhesh", "lat": 26.87, "lng": 85.91, "municipalities": 136, "total_citizens": 6126288, "top_employment": "FARMER"},
    {"id": "prov-bagmati", "name": "Bagmati", "lat": 27.70, "lng": 85.33, "municipalities": 119, "total_citizens": 6116866, "top_employment": "PRIVATE_SECTOR"},
    {"id": "prov-gandaki", "name": "Gandaki", "lat": 28.25, "lng": 84.43, "municipalities": 85, "total_citizens": 2479745, "top_employment": "FOREIGN_ABROAD"},
    {"id": "prov-lumbini", "name": "Lumbini", "lat": 27.80, "lng": 83.00, "municipalities": 109, "total_citizens": 5124225, "top_employment": "FARMER"},
    {"id": "prov-karnali", "name": "Karnali", "lat": 29.00, "lng": 82.17, "municipalities": 79, "total_citizens": 1694889, "top_employment": "FARMER"},
    {"id": "prov-sudurpashchim", "name": "Sudurpashchim", "lat": 29.29, "lng": 80.57, "municipalities": 88, "total_citizens": 2711270, "top_employment": "FOREIGN_ABROAD"},
]
write("provinces.json", provinces)

# ---------------- Users ----------------
users = [
    {"id": "usr-001", "username": "ward.admin", "password": "ward123", "role": "WARD_ADMIN", "full_name": "Bibek Aryal", "phone": "9842011001", "jurisdiction_id": "ward-004", "jurisdiction_name": "Kummayak Ward 4 — Bhagawati", "is_active": True, "last_login": iso(NOW - timedelta(hours=3)), "failed_logins": 0, "locked_until": None, "password_changed_at": iso(NOW - timedelta(days=20)), "created_at": iso(NOW - timedelta(days=120))},
    {"id": "usr-002", "username": "mun.admin", "password": "mun123", "role": "LOCAL_BODY_ADMIN", "full_name": "Jenish Adhikari", "phone": "9842011002", "jurisdiction_id": "mun-001", "jurisdiction_name": "Kummayak Rural Municipality", "is_active": True, "last_login": iso(NOW - timedelta(hours=6)), "failed_logins": 0, "locked_until": None, "password_changed_at": iso(NOW - timedelta(days=15)), "created_at": iso(NOW - timedelta(days=200))},
    {"id": "usr-003", "username": "province.admin", "password": "prov123", "role": "PROVINCE_ADMIN", "full_name": "Pragya Maharjan", "phone": "9842011003", "jurisdiction_id": "prov-koshi", "jurisdiction_name": "Koshi Province", "is_active": True, "last_login": iso(NOW - timedelta(days=1)), "failed_logins": 0, "locked_until": None, "password_changed_at": iso(NOW - timedelta(days=10)), "created_at": iso(NOW - timedelta(days=300))},
    {"id": "usr-004", "username": "central.admin", "password": "central123", "role": "CENTRAL_ADMIN", "full_name": "Rishi Raj", "phone": "9842011004", "jurisdiction_id": "central", "jurisdiction_name": "Government of Nepal — Central", "is_active": True, "last_login": iso(NOW - timedelta(hours=12)), "failed_logins": 0, "locked_until": None, "password_changed_at": iso(NOW - timedelta(days=5)), "created_at": iso(NOW - timedelta(days=400))},
    {"id": "usr-005", "username": "sysadmin", "password": "admin123", "role": "SYSTEM_ADMIN", "full_name": "Shrijan Gajurel", "phone": "9842011005", "jurisdiction_id": "system", "jurisdiction_name": "System Administration", "is_active": True, "last_login": iso(NOW - timedelta(hours=1)), "failed_logins": 0, "locked_until": None, "password_changed_at": iso(NOW - timedelta(days=2)), "created_at": iso(NOW - timedelta(days=500))},
]
# extra ward admins (for management screens)
extra_wards = [
    ("Saraswati Limbu", "saraswati.limbu", 1, True, 0, None),
    ("Dipak Tamang", "dipak.tamang", 2, True, 0, None),
    ("Anjana Rai", "anjana.rai", 3, True, 4, None),
    ("Hari Prasad Subba", "hari.subba", 5, True, 0, None),
    ("Manoj Gurung", "manoj.gurung", 6, False, 1, None),
    ("Sunita Magar", "sunita.magar", 7, True, 2, None),
    ("Kamal Bhattarai", "kamal.bhattarai", 8, True, 0, None),
    ("Rekha Limbu", "rekha.limbu", 9, True, 6, iso(NOW + timedelta(minutes=10))),
]
for i, (fn, un, w, active, fails, locked) in enumerate(extra_wards, start=6):
    users.append({
        "id": f"usr-{i:03d}", "username": un, "password": "temp1234", "role": "WARD_ADMIN",
        "full_name": fn, "phone": f"98420110{i:02d}", "jurisdiction_id": f"ward-{w:03d}",
        "jurisdiction_name": f"Kummayak Ward {w} — {WARD_NAMES[w-1][0]}", "is_active": active,
        "last_login": iso(NOW - timedelta(days=random.randint(0, 9))) if active else None,
        "failed_logins": fails, "locked_until": locked,
        "password_changed_at": iso(NOW - timedelta(days=random.randint(5, 60))),
        "created_at": iso(NOW - timedelta(days=random.randint(60, 180))),
    })
# province admins for other provinces (central mgmt)
for i, p in enumerate(provinces):
    if p["id"] == "prov-koshi":
        continue
    users.append({
        "id": f"usr-pa-{i:02d}", "username": f"{p['name'].lower()}.admin", "password": "temp1234",
        "role": "PROVINCE_ADMIN", "full_name": random.choice(["Bishal Thapa", "Nirmala Shah", "Gopal Yadav", "Sushma Bista", "Tek Bahadur Oli", "Indira Chaudhary"]),
        "phone": f"98410220{i:02d}", "jurisdiction_id": p["id"], "jurisdiction_name": f"{p['name']} Province",
        "is_active": i % 5 != 0, "last_login": iso(NOW - timedelta(days=random.randint(0, 14))),
        "failed_logins": random.choice([0, 0, 0, 3]), "locked_until": None,
        "password_changed_at": iso(NOW - timedelta(days=random.randint(3, 40))),
        "created_at": iso(NOW - timedelta(days=random.randint(100, 350))),
    })
write("users.json", users)

# ---------------- Citizens ----------------
MALE_NP = [("Ram Bahadur Thapa", "राम बहादुर थापा"), ("Hari Prasad Limbu", "हरि प्रसाद लिम्बु"), ("Krishna Subba", "कृष्ण सुब्बा"), ("Bishnu Rai", "विष्णु राई"), ("Tek Bahadur Gurung", "टेक बहादुर गुरुङ"), ("Dilip Tamang", "दिलिप तामाङ"), ("Suresh Magar", "सुरेश मगर"), ("Gopal Bhattarai", "गोपाल भट्टराई"), ("Naresh Khadka", "नरेश खड्का"), ("Padam Limbu", "पदम लिम्बु"), ("Mohan Adhikari", "मोहन अधिकारी"), ("Bir Bahadur Sherpa", "बिर बहादुर शेर्पा")]
FEMALE_NP = [("Sita Kumari Limbu", "सीता कुमारी लिम्बु"), ("Gita Rai", "गीता राई"), ("Maya Gurung", "माया गुरुङ"), ("Sarita Subba", "सरिता सुब्बा"), ("Kamala Thapa", "कमला थापा"), ("Radha Tamang", "राधा तामाङ"), ("Bishnu Maya Magar", "विष्णु माया मगर"), ("Laxmi Khadka", "लक्ष्मी खड्का"), ("Sabita Bhattarai", "सबिता भट्टराई"), ("Nirmala Rai", "निर्मला राई"), ("Devi Sherpa", "देवी शेर्पा"), ("Januka Limbu", "जनुका लिम्बु")]
TOLES = ["Bhagwati Tole", "Bazar Line", "Upallo Gaun", "Tallo Gaun", "Deurali", "Salleri", "Mangalbare", "Dovan"]
RELIGIONS = ["Hindu", "Buddhist", "Kirat", "Christian"]
ETHNICITIES = ["Limbu", "Rai", "Tamang", "Gurung", "Magar", "Chhetri", "Brahmin", "Sherpa"]
BLOOD = ["A+", "B+", "O+", "AB+", "A-", "O-"]
EMP_CATS = ["FARMER", "UNEMPLOYED", "FOREIGN_ABROAD", "GOVERNMENT", "STUDENT", "PRIVATE_SECTOR", "SELF_EMPLOYED", "DAILY_WAGE", "RETIRED", "HOMEMAKER"]
INCOME = ["UNDER_5K", "5K_10K", "10K_25K", "25K_50K", "50K_100K", "OVER_100K"]
COUNTRIES = ["Qatar", "Malaysia", "Saudi Arabia", "UAE", "South Korea", "Kuwait"]
VISA = ["Work Permit", "EPS", "Free Visa", "Skilled Worker"]
DISAB_TYPES = ["PHYSICAL", "SENSORY", "INTELLECTUAL", "MENTAL", "MULTIPLE"]
EDU_LEVELS = ["NO_FORMAL", "PRIMARY", "SECONDARY", "HIGHER_SECONDARY", "BACHELOR", "MASTER", "PHD"]


def emp_details(cat):
    if cat == "UNEMPLOYED":
        return {"duration_months": random.randint(3, 36), "skills": "Carpentry, Driving", "employment_office_registered": random.choice([True, False])}
    if cat == "FARMER":
        return {"land_area_ropani": round(random.uniform(2, 20), 1), "land_type": random.choice(["Khet", "Bari", "Mixed"]), "primary_crop": random.choice(["Paddy", "Maize", "Cardamom", "Ginger"]), "irrigation_type": random.choice(["Rain-fed", "Canal", "Tube-well"]), "agri_loan": random.choice([True, False])}
    if cat == "FOREIGN_ABROAD":
        return {"country": random.choice(COUNTRIES), "visa_type": random.choice(VISA), "employer_name": "Gulf Constructions Ltd", "departure_date": date(NOW - timedelta(days=random.randint(100, 900))), "expected_return": date(NOW + timedelta(days=random.randint(100, 700))), "remittance_band": random.choice(INCOME), "doe_registered": True}
    if cat == "GOVERNMENT":
        return {"ministry": random.choice(["Education", "Health", "Home Affairs"]), "grade": random.choice(["Gazetted", "Non-Gazetted"]), "posting_district": "Panchthar", "service_entry_year": random.randint(2005, 2022)}
    if cat == "STUDENT":
        return {"institution_name": "Phidim Multiple Campus", "level": random.choice(["Bachelor", "Higher Secondary"]), "field_of_study": random.choice(["Management", "Education", "Science"]), "location": random.choice(["Nepal", "Abroad"])}
    return {"occupation_note": cat.title()}


citizens = []
cid = 0
# Distribute citizens across wards; ward-004 (Bibek) gets the most
ward_distribution = {4: 12, 1: 3, 2: 3, 3: 3, 5: 3, 6: 2, 7: 2, 8: 2, 9: 2}
for wno, count in sorted(ward_distribution.items()):
    for _ in range(count):
        cid += 1
        sex = random.choice(["MALE", "FEMALE", "FEMALE", "MALE"])
        if sex == "MALE":
            en, np = random.choice(MALE_NP)
        else:
            en, np = random.choice(FEMALE_NP)
        cat = random.choice(EMP_CATS)
        dob = NOW - timedelta(days=random.randint(18 * 365, 80 * 365))
        sync = random.choice(["synced", "synced", "synced", "pending", "conflict"])
        c = {
            "id": f"cit-{cid:03d}",
            "ward_id": f"ward-{wno:03d}",
            "name_np": np,
            "name_en": en,
            "nid_masked": f"****{random.randint(1000, 9999)}",
            "nid_verified": random.choice([True, True, False]),
            "sex": sex,
            "dob": date(dob),
            "blood_group": random.choice(BLOOD),
            "religion": random.choice(RELIGIONS),
            "ethnicity": random.choice(ETHNICITIES),
            "mother_tongue": random.choice(["Limbu", "Nepali", "Tamang", "Rai"]),
            "tole": random.choice(TOLES),
            "digital_literacy": random.choice(["NONE", "BASIC", "INTERMEDIATE", "ADVANCED"]),
            "has_smartphone": random.choice([True, True, False]),
            "sync_status": sync,
            "is_active": True,
            "employment_category": cat,
            "income_band": random.choice(INCOME),
            "consent_channel": random.choice(["WARD_OFFICE", "FIELD", "VERBAL_WITNESS"]),
            "consent_recorded_at": iso(NOW - timedelta(days=random.randint(5, 200))),
            "created_at": iso(NOW - timedelta(days=random.randint(5, 200))),
            "family": [],
            "employment": {"citizen_id": f"cit-{cid:03d}", "category": cat, "income_band": random.choice(INCOME), "details": emp_details(cat)},
            "education": {
                "level": random.choice(EDU_LEVELS),
                "institution_name": random.choice(["Bhagawati Secondary School", "Phidim Multiple Campus", "Janata Primary School"]),
                "institution_type": random.choice(["PUBLIC", "PRIVATE", "COMMUNITY"]),
                "study_location": "NEPAL",
                "is_dropout": random.choice([False, False, True]),
                "dropout_reason": random.choice(["Financial hardship", "Migration", "Family responsibility"]),
                "scholarship": None,
            },
            "household": {
                "id": f"hh-{cid:03d}",
                "house_type": random.choice(["Own", "Rented", "Joint Family"]),
                "construction_type": random.choice(["RCC", "Stone-Mud", "Wooden", "Cement-Brick"]),
                "room_count": random.randint(2, 7),
                "electricity_source": random.choice(["National Grid", "Solar", "Micro-hydro"]),
                "water_source": random.choice(["Piped", "Well", "Spring", "Tanker"]),
                "sanitation": random.choice(["Flush toilet", "Pit latrine"]),
                "internet_access": random.choice([True, False]),
                "bank_account": random.choice([True, True, False]),
                "monthly_income_band": random.choice(INCOME),
                "poverty_class": random.choice(["BELOW", "NEAR", "ABOVE"]),
            },
            "gps": {"lat": round(27.0 + random.uniform(0, 0.4), 5), "lng": round(87.6 + random.uniform(0, 0.4), 5)},
            "disability": None,
        }
        # family
        c["family"] = [
            {"relation": "FATHER", "name": random.choice(MALE_NP)[0], "citizenship_no": f"12-01-7{random.randint(0,5)}-0{random.randint(1000,9999)}", "link_status": random.choice(["linked", "pending"])},
            {"relation": "MOTHER", "name": random.choice(FEMALE_NP)[0], "citizenship_no": f"12-01-7{random.randint(0,5)}-0{random.randint(1000,9999)}", "link_status": random.choice(["linked", "pending"])},
        ]
        citizens.append(c)

# Guarantee a spread of foreign-employment records for analytics
for c in random.sample(citizens, 5):
    c["employment_category"] = "FOREIGN_ABROAD"
    c["employment"]["category"] = "FOREIGN_ABROAD"
    c["employment"]["details"] = emp_details("FOREIGN_ABROAD")

# Add disability profiles to a few citizens
for c in random.sample(citizens, 4):
    c["disability"] = {
        "citizen_id": c["id"],
        "disability_type": random.choice(DISAB_TYPES),
        "severity_body": random.randint(0, 4),
        "severity_activity": random.randint(0, 4),
        "severity_participation": random.randint(0, 4),
        "certificate_no": f"DIS-{random.randint(10000,99999)}",
        "issuing_hospital": "Panchthar District Hospital",
        "expiry_date": date(NOW + timedelta(days=random.randint(200, 1000))),
    }
write("citizens.json", citizens)

# households separate file
write("households.json", [c["household"] | {"citizen_id": c["id"], "ward_id": c["ward_id"]} for c in citizens])
# employment separate file
write("employment.json", [c["employment"] for c in citizens])
# disability separate file
write("disability.json", [c["disability"] for c in citizens if c["disability"]])

# foreign employment
foreign = []
for c in citizens:
    if c["employment_category"] == "FOREIGN_ABROAD":
        d = c["employment"]["details"]
        foreign.append({
            "citizen_id": c["id"], "citizen_name": c["name_en"], "ward_id": c["ward_id"],
            "country": d["country"], "visa_type": d["visa_type"], "employer_name": d["employer_name"],
            "departure_date": d["departure_date"], "expected_return": d["expected_return"],
            "remittance_band": d["remittance_band"], "doe_registered": d["doe_registered"],
        })
write("foreign-employment.json", foreign)

# ---------------- ID Cards ----------------
CARD_TYPES = ["UNEMPLOYMENT", "DISABILITY", "SENIOR", "SINGLE_WOMAN", "FARMER"]
ID_FLOW = ["INITIATED", "PENDING_APPROVAL", "PDF_GENERATION", "QR_SIGNED", "SMS_PENDING", "APPROVED", "COLLECTED"]
id_cards = []
for i, c in enumerate(random.sample(citizens, 12), start=1):
    status = random.choice(["PENDING_APPROVAL", "APPROVED", "COLLECTED", "EXPIRED", "REVOKED", "QR_SIGNED"])
    issued = NOW - timedelta(days=random.randint(10, 300))
    history = []
    flow = ID_FLOW[: ID_FLOW.index(status) + 1] if status in ID_FLOW else ID_FLOW
    t = issued
    for st in flow:
        history.append({"state": st, "at": iso(t), "note": ""})
        t += timedelta(days=random.randint(1, 5))
    id_cards.append({
        "id": f"idc-{i:03d}", "citizen_id": c["id"], "citizen_name": c["name_en"], "ward_id": c["ward_id"],
        "card_type": random.choice(CARD_TYPES), "status": status,
        "qr_hash": f"QR-{random.randint(10**9, 10**10)}",
        "issued_date": date(issued) if status not in ("INITIATED", "PENDING_APPROVAL") else None,
        "expiry_date": date(issued + timedelta(days=1825)) if status in ("APPROVED", "COLLECTED", "EXPIRED") else None,
        "collected_at": date(issued + timedelta(days=20)) if status == "COLLECTED" else None,
        "history": history,
    })
write("id-cards.json", id_cards)

# ---------------- Grievances ----------------
GR_CATS = ["DATA_INACCURACY", "BENEFIT_DENIAL", "ID_CARD_ISSUE", "PRIVACY_VIOLATION", "SYSTEM_ACCESS", "OTHER"]
GR_STATUS = ["RECEIVED", "IN_PROGRESS", "RESOLVED_WARD", "REFERRED_JUDICIAL", "CLOSED"]
GR_DESC = {
    "DATA_INACCURACY": "Date of birth recorded incorrectly in the citizen record; requires correction as per citizenship certificate.",
    "BENEFIT_DENIAL": "Senior citizen allowance application was rejected despite meeting the age criteria.",
    "ID_CARD_ISSUE": "Disability ID card not received even after approval; QR code does not verify.",
    "PRIVACY_VIOLATION": "Personal data appears to have been shared without consent during field survey.",
    "SYSTEM_ACCESS": "Unable to access the citizen portal to update household information.",
    "OTHER": "General request for assistance regarding ward office services.",
}
grievances = []
for i, c in enumerate(random.sample(citizens, 9), start=1):
    cat = random.choice(GR_CATS)
    status = random.choice(GR_STATUS)
    filed = NOW - timedelta(days=random.randint(1, 40))
    timeline = [{"status": "RECEIVED", "at": iso(filed), "actor": "Ward Admin", "note": "Grievance registered."}]
    if status != "RECEIVED":
        timeline.append({"status": "IN_PROGRESS", "at": iso(filed + timedelta(days=1)), "actor": "Bibek Aryal", "note": "Investigation started."})
    if status in ("RESOLVED_WARD", "CLOSED"):
        timeline.append({"status": "RESOLVED_WARD", "at": iso(filed + timedelta(days=3)), "actor": "Bibek Aryal", "note": "Resolved at ward level."})
    if status == "REFERRED_JUDICIAL":
        timeline.append({"status": "REFERRED_JUDICIAL", "at": iso(filed + timedelta(days=4)), "actor": "Bibek Aryal", "note": "Referred to judicial committee."})
    grievances.append({
        "id": f"grv-{i:03d}", "tracking_code": f"GRV-2026-{i:06d}", "citizen_id": c["id"],
        "citizen_name": c["name_en"], "ward_id": c["ward_id"], "category": cat,
        "description": GR_DESC[cat], "status": status, "filed_at": iso(filed),
        "sla_due": iso(filed + timedelta(days=15)), "timeline": timeline,
    })
write("grievances.json", grievances)

# ---------------- Edit approvals ----------------
FIELDS = [("tole", "Bhagwati Tole", "Bazar Line"), ("name_en", "Ram Bahadur Thapa", "Ram B. Thapa"), ("employment_category", "UNEMPLOYED", "FOREIGN_ABROAD"), ("income_band", "UNDER_5K", "10K_25K"), ("blood_group", "A+", "O+")]
approvals = []
for i, c in enumerate(random.sample(citizens, 8), start=1):
    status = random.choice(["PENDING", "PENDING", "APPROVED", "REJECTED", "CAO_REVIEW"])
    sub = NOW - timedelta(days=random.randint(1, 9))
    nchanges = random.randint(1, 3)
    chosen = random.sample(FIELDS, nchanges)
    escalated = None
    if status == "CAO_REVIEW":
        escalated = iso(sub + timedelta(days=5))
    approvals.append({
        "id": f"edit-{i:03d}", "citizen_id": c["id"], "citizen_name": c["name_en"], "ward_id": c["ward_id"],
        "submitted_by": "Bibek Aryal", "submitter_id": "usr-001", "submitted_at": iso(sub),
        "reason": random.choice(["Correction per citizenship certificate", "Updated after field verification", "Citizen requested update"]),
        "status": status,
        "changes": [{"field": f, "old_value": o, "new_value": n} for f, o, n in chosen],
        "escalated_at": escalated,
        "decision_note": "Approved after verification." if status == "APPROVED" else ("Insufficient documentation." if status == "REJECTED" else ""),
    })
write("edit-approvals.json", approvals)

# ---------------- Sync batches + conflicts ----------------
conflicts = []
sync_batches = []
for i in range(1, 9):
    wno = random.choice(list(ward_distribution.keys()))
    submitted = NOW - timedelta(hours=random.randint(1, 60))
    rc = random.randint(5, 40)
    cc = random.choice([0, 0, 1, 2])
    fc = random.choice([0, 0, 1])
    ward_citizens = [c for c in citizens if c["ward_id"] == f"ward-{wno:03d}"] or citizens
    recs = [{"citizen_id": c["id"], "citizen_name": c["name_en"], "sync_status": random.choice(["synced", "synced", "pending", "failed"])} for c in random.sample(ward_citizens, min(len(ward_citizens), random.randint(2, 5)))]
    batch_conflicts = []
    for k in range(cc):
        cc_cit = random.choice(ward_citizens)
        conf = {
            "id": f"conf-{i:02d}-{k}", "citizen_id": cc_cit["id"], "citizen_name": cc_cit["name_en"],
            "ward_id": f"ward-{wno:03d}", "device_id": f"DEV-{random.randint(100,999)}",
            "resolution_status": random.choice(["PENDING_REVIEW", "PENDING_REVIEW", "MERGED", "OVERWRITTEN"]),
            "created_at": iso(submitted),
            "fields": [
                {"field": "tole", "server_value": "Bhagwati Tole", "device_value": "Bazar Line"},
                {"field": "has_smartphone", "server_value": "false", "device_value": "true"},
            ],
        }
        conflicts.append(conf)
        batch_conflicts.append(conf)
    sync_batches.append({
        "id": f"batch-{random.randint(10**6,10**7)}", "ward_id": f"ward-{wno:03d}", "device_id": f"DEV-{random.randint(100,999)}",
        "submitted_at": iso(submitted), "record_count": rc, "conflict_count": cc, "failed_count": fc,
        "status": "conflict" if cc else ("failed" if fc else "synced"), "records": recs, "conflicts": batch_conflicts,
    })
write("sync-batches.json", sync_batches)
write("sync-conflicts.json", conflicts)

# ---------------- Eligibility rules ----------------
rules = [
    {"id": "rule-001", "rule_name": "Unemployment Allowance — Registered Jobseekers", "benefit_type": "UNEMPLOYMENT_ID", "condition_summary": "Unemployed > 6 months AND age 18-59", "condition_expression": '{"and":[{"==":["employment_category","UNEMPLOYED"]},{">":["duration_months",6]}]}', "benefit_value": "NPR 2000/month", "priority": 1, "is_active": True, "affected_count": 0},
    {"id": "rule-002", "rule_name": "Disability ID — WHO ICF Severity >= 2", "benefit_type": "DISABILITY_ID", "condition_summary": "Disability severity (any axis) >= 2", "condition_expression": '{">=":["max_severity",2]}', "benefit_value": "Card + NPR 3000/month", "priority": 2, "is_active": True, "affected_count": 0},
    {"id": "rule-003", "rule_name": "Senior Citizen Allowance", "benefit_type": "SENIOR_CITIZEN", "condition_summary": "Age >= 68 years", "condition_expression": '{">=":["age",68]}', "benefit_value": "NPR 4000/month", "priority": 3, "is_active": True, "affected_count": 0},
    {"id": "rule-004", "rule_name": "Single Woman Allowance", "benefit_type": "SINGLE_WOMAN", "condition_summary": "Female AND (widow OR unmarried >= 60)", "condition_expression": '{"and":[{"==":["sex","FEMALE"]},{">=":["age",60]}]}', "benefit_value": "NPR 2660/month", "priority": 4, "is_active": True, "affected_count": 0},
    {"id": "rule-005", "rule_name": "Food Subsidy — Below Poverty Line", "benefit_type": "FOOD_SUBSIDY", "condition_summary": "Household poverty_class = BELOW", "condition_expression": '{"==":["poverty_class","BELOW"]}', "benefit_value": "Subsidised grain quota", "priority": 5, "is_active": True, "affected_count": 0},
    {"id": "rule-006", "rule_name": "Health Insurance Premium Support", "benefit_type": "HEALTH_INSURANCE", "condition_summary": "Income band UNDER_5K OR 5K_10K", "condition_expression": '{"in":["income_band",["UNDER_5K","5K_10K"]]}', "benefit_value": "100% premium covered", "priority": 6, "is_active": False, "affected_count": 0},
]
for r in rules:
    r["created_at"] = iso(NOW - timedelta(days=random.randint(30, 300)))
    r["affected_count"] = random.randint(120, 4800)
    r["history"] = [
        {"at": r["created_at"], "by": "Saudeep Adhikari", "action": "Rule created"},
        {"at": iso(NOW - timedelta(days=random.randint(1, 20))), "by": "Saudeep Adhikari", "action": "Priority updated"},
    ]
write("eligibility-rules.json", rules)

# ---------------- Audit log ----------------
EVT = ["REGISTERED", "UPDATED", "APPROVED", "REJECTED", "CONFLICT_RESOLVED", "ID_CARD_ISSUED", "DATA_PURGED", "PASSWORD_RESET"]
ROLES = ["WARD_ADMIN", "LOCAL_BODY_ADMIN", "PROVINCE_ADMIN", "CENTRAL_ADMIN", "SYSTEM_ADMIN"]
JUR = ["Kummayak Ward 4", "Kummayak Ward 1", "Kummayak Rural Municipality", "Koshi Province", "Central"]
audit = []
for i in range(1, 61):
    c = random.choice(citizens)
    audit.append({
        "id": f"evt-{i:04d}", "event_type": random.choice(EVT),
        "citizen_id_masked": c["id"][:8] + "****",
        "acted_by_role": random.choice(ROLES), "jurisdiction": random.choice(JUR),
        "timestamp": iso(NOW - timedelta(hours=random.randint(1, 720))),
    })
audit.sort(key=lambda x: x["timestamp"], reverse=True)
write("audit-log.json", audit)

# ---------------- Policy cards ----------------
policies = [
    {"id": "pol-001", "title": "Address rising unemployment in Karnali", "category": "EMPLOYMENT", "description": "Unemployment rate in Karnali municipalities exceeds 22%, well above national average.", "suggested_action": "Launch targeted skills & employment program; expand jobseeker registration.", "suggested_deadline": date(NOW + timedelta(days=60)), "province": "Karnali", "status": "PENDING_REVIEW"},
    {"id": "pol-002", "title": "Disability certificate backlog in Madhesh", "category": "HEALTH", "description": "Over 1,200 disability ID applications pending hospital certification.", "suggested_action": "Deploy mobile assessment camps with district hospitals.", "suggested_deadline": date(NOW + timedelta(days=45)), "province": "Madhesh", "status": "ACKNOWLEDGED"},
    {"id": "pol-003", "title": "Remittance dependency in Gandaki", "category": "EMPLOYMENT", "description": "Over 35% of households depend on foreign remittance; high economic risk.", "suggested_action": "Promote returnee reintegration & local enterprise grants.", "suggested_deadline": date(NOW + timedelta(days=90)), "province": "Gandaki", "status": "IN_PROGRESS"},
    {"id": "pol-004", "title": "School dropout spike in Lumbini", "category": "EDUCATION", "description": "Secondary dropout rate increased 8% year on year.", "suggested_action": "Expand scholarship coverage; targeted retention program.", "suggested_deadline": date(NOW + timedelta(days=120)), "province": "Lumbini", "status": "PENDING_REVIEW"},
    {"id": "pol-005", "title": "Water & sanitation gap in Sudurpashchim", "category": "INFRASTRUCTURE", "description": "30% of households lack piped water access.", "suggested_action": "Prioritise rural water supply infrastructure budget.", "suggested_deadline": date(NOW + timedelta(days=180)), "province": "Sudurpashchim", "status": "COMPLETED"},
    {"id": "pol-006", "title": "Senior citizen allowance coverage in Bagmati", "category": "BENEFITS", "description": "Eligible seniors not enrolled estimated at 4,500.", "suggested_action": "Automated eligibility detection rollout; door-to-door enrollment.", "suggested_deadline": date(NOW + timedelta(days=75)), "province": "Bagmati", "status": "PENDING_REVIEW"},
    {"id": "pol-007", "title": "Monsoon disaster preparedness — Koshi", "category": "DISASTER", "description": "High-risk wards identified for landslide/flooding this monsoon.", "suggested_action": "Pre-position relief; update vulnerable household registry.", "suggested_deadline": date(NOW + timedelta(days=30)), "province": "Koshi", "status": "ACKNOWLEDGED"},
]
write("policy-cards.json", policies)

# flag anomalies (initial seed)
write("flag-anomalies.json", [])

print("ALL DONE")
