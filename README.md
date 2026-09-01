# 🏆 CareLink AI — Digital Care-Coordination Layer (SIH 2026)

> **Smart India Hackathon 2026 — Problem Statement SIH26133**  
> **Ministry of Health & Family Welfare / Government of Maharashtra**  
> **Core Principle**: *"Reach ➔ Assess ➔ Route ➔ Refer ➔ Continue ➔ Follow-Up"*  
> **Live Production Demo**: [https://carelink-one-olive.vercel.app/](https://carelink-one-olive.vercel.app/)

---

## 📖 1. CareLink AI Overview

CareLink AI (SETU) is a digital care-coordination layer designed for rural public healthcare systems in India. Rather than attempting to replace clinicians or autonomously diagnose diseases, CareLink AI acts as a **transactional care-coordination backbone** connecting frontline ASHA/ANM health workers, Primary Health Centres (PHCs), District Hospitals, and rural patients.

### Core Value Proposition
> **“We don't replace the public healthcare system. We make the patient's journey through it continuous.”**

---

## 🎯 2. SIH26133 Problem Statement

* **Title**: Digital Solution for Integrated Patient Care Coordination, Triage, Referral Tracking, and Follow-Up in Rural Healthcare Networks.
* **Category**: Software (Healthcare & MedTech).
* **Nodal Ministry**: Ministry of Health & Family Welfare (MoHFW) / State Health Department Maharashtra.
* **Problem Summary**: Rural patients in India face severe care fragmentation when moving across healthcare tiers (Sub-centre ➔ PHC ➔ District Hospital). Referrals are often informal paper notes without tracking, resulting in high drop-off rates, wrong-specialty visits, unmonitored high-risk pregnancies (ANC), and missed chronic disease follow-ups.

---

## 🗺️ 3. Problem ➔ Solution Mapping

| Documented Public Health Gap | CareLink AI Technical Solution | Implementation Status |
|---|---|---|
| **Informal / Paper Referrals** | Enforced 7-state Referral State Machine (`referralStateMachine.js`) | 🟢 BUILD (Fully Functional) |
| **Wrong Specialty Routing** | Multi-factor Deterministic Facility Matcher (`facilityMatcher.js`) | 🟢 BUILD (Fully Functional) |
| **Unmonitored High-Risk ANC** | Deterministic Triage Engine (`triageEngine.js`) based on NHM Guidelines | 🟢 BUILD (Fully Functional) |
| **Missed Follow-Ups & Drop-Offs** | Missed Care Action Alert Engine (`AshaDashboard.jsx`) | 🟢 BUILD (Fully Functional) |
| **Information Loss Between Tiers** | Unified Longitudinal Patient Care Timeline (`PatientProfile.jsx`) | 🟢 BUILD (Fully Functional) |
| **Multilingual Rural Accessibility** | 100% Dual English & Marathi (`मराठी`) Dictionary (`translations.js`) | 🟢 BUILD (Fully Functional) |
| **Public Kiosk Access & Privacy** | Token session timer & sensitive category triage phone callback | 🟡 DEMO / MOCK |
| **Toll-Free Voice Telephony** | Autonomous IVR TwiML Webhook integration simulation | 🟡 DEMO / MOCK |

---

## 🏗️ 4. System Architecture & Data Flow

```text
                                  CARELINK AI ARCHITECTURE
                                              │
       ┌──────────────────────────────┬───────┴──────────────┬──────────────────────────────┐
       ↓                              ↓                      ↓                              ↓
┌──────────────┐              ┌──────────────┐        ┌──────────────┐              ┌──────────────┐
│  Tier 1: IVR │              │Tier 2: Kiosk │        │Tier 3: ASHA  │              │Tier 4: Doctor│
│Voice Webhook │              │  Public OPD  │        │  Field App   │              │  & Admin UI  │
└──────┬───────┘              └──────┬───────┘        └──────┬───────┘              └──────┬───────┘
       │                             │                       │                             │
       └─────────────────────────────┴───────────┬───────────┴─────────────────────────────┘
                                                 │
                                     REST API / JSON Persistence
                                                 │
                                 ┌───────────────┴───────────────┐
                                 │     Supabase PostgreSQL       │
                                 │   Single Source of Truth DB   │
                                 └───────────────┬───────────────┘
                                                 │
                                     ┌───────────┴───────────┐
                                     │   IndexedDB Offline   │
                                     │ Append-Only Sync Queue│
                                     └───────────────────────┘
```

---

## 🧩 5. Core Modules Specification

### Module 1: Clinical Triage & Safety Boundary (`triageEngine.js`)
* **Clinical Safety Boundary**: Recommends **Urgency, Care Level, and Rationale** (`URGENT MATERNAL CLINICAL EVALUATION`). Explicitly avoids claiming autonomous clinical diagnoses.
* **Documented Guidelines**: Each red-flag rule references official protocols (e.g., `NHM Guidelines for High Risk Pregnancy`, `IMNCI India Protocol`, `NTEP Technical Guidelines`).

### Module 2: Smart Facility Matcher (`facilityMatcher.js`)
* **Deterministic Matching**: Evaluates required specialty (OB-GYN, Pediatrics, General Medicine), working diagnostics (Ultrasound, Blood Test, ECG), on-duty doctors, and queue length.
* **Why Recommended? Box**: Outputs visible transparent match rationale (e.g. `✓ OB-GYN Available · ✓ Ultrasound Working · 👥 Queue: 18`).

### Module 3: Referral Lifecycle State Machine (`referralStateMachine.js`)
* **7-State Lifecycle**: `CREATED ➔ NOTIFIED ➔ CONFIRMED ➔ IN_CONSULTATION ➔ COMPLETED ➔ FOLLOW_UP_SCHEDULED ➔ CLOSED`.
* **Re-Referral Branch**: `WRONG_DESTINATION ➔ RE_ROUTED ➔ NEW_DESTINATION` (re-routes to new facility while preserving original Referral ID #1042 and timeline history).

### Module 4: Missed Care Follow-up Engine (`AshaDashboard.jsx`)
* **Proactive Trigger**: Driven by **expected care due dates vs attendance** (e.g., *Sunita Jadhav — ANC 3rd Trimester Follow-up due 15 Aug, 16 days overdue*).

---

## 💻 6. Technology Stack Breakdown

* **Frontend**: React 18, Vite 5.4, React Router DOM v6, React Context API, Vanilla CSS3 (Luxury Design System Tokens), Chart.js 4, Lucide React icons, Axios.
* **Backend**: Node.js (ES Modules), Express 4, Supabase PostgreSQL, `dbPersistence.js` (JSON file-backed DB with atomic writes for zero-config local persistence).
* **Engines & Data**: `triageEngine.js`, `facilityMatcher.js`, `referralStateMachine.js`, `redFlagRules.js`, `translations.js` (156 EN/MR keys).

---

## ⚡ 7. Local Setup & Installation

### Prerequisites
* Node.js v18.0 or higher
* npm v9.0 or higher

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/setu.git
cd setu
```

### Step 2: Install Dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Step 3: Launch Local Servers
```bash
# Terminal 1: Launch Backend API Server (Port 3001)
cd backend
npm start

# Terminal 2: Launch Frontend Dev Server (Port 5173)
cd frontend
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 🔐 8. Environment Variables Guide

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

### Backend (`backend/.env`)
```env
PORT=3001
NODE_ENV=development
SUPABASE_DB_URL=postgresql://postgres:[password]@db.supabase.co:5432/postgres
```

---

## 🔑 9. Demo Credentials Matrix

| Role | Role Tab | Username / Phone | Password | Facility Assigned |
|---|---|---|---|---|
| **ASHA Field Officer** | ASHA / ANM | `9812345001` | `password123` | Sub-centre Wai |
| **Physician / Specialist** | Physician | `dr.kulkarni@carelink.gov.in` | `password123` | PHC Karjat / District Hospital Satara |
| **Executive / Admin** | Executive Admin | `dho.satara@carelink.gov.in` | `password123` | Satara District Health System |
| **Patient OPD Ticket** | Patient OPD | `9812345001` | `password123` | Personal OPD Portal |
| **Public Kiosk Access** | Village Kiosk | *Token: `T-88219`* | *No password required* | Gram Panchayat Kiosk |

---

## 🎬 10. "How to Demo" Narrative (Hero Flow)

For judges, run the **Sunita Jadhav Hero Scenario** in this order:

1. **Login Gateway (`/login`)**: Select **ASHA / ANM** tab (or click demo chip *Anita Shinde*) ➔ Click **Secure Healthcare Login**.
2. **ASHA Dashboard (`/asha`)**: View **Missed Care Action Alerts** ➔ Click on overdue patient **Sunita Jadhav** (16 days overdue for ANC 3rd Trimester checkup).
3. **Patient Profile & Timeline (`/asha/patient/p1`)**: Review longitudinal care timeline ➔ Click **Start Triage Assessment**.
4. **Step 1 Symptom Intake (`/asha/triage/p1`)**: Click **Voice Mic** simulation (auto-selects headache + swelling) ➔ Click **Next: Enter Vitals**.
5. **Step 2 Vitals Entry**: Enter Systolic BP `152`, Diastolic BP `96`, Temp `98.6°F` ➔ Click **Evaluate Red-Flags**.
6. **Step 3 Triage & Facility Match**: View **URGENT MATERNAL CLINICAL EVALUATION** title + NHM protocol reference + **District Hospital Satara** match with **Why Recommended?** box ➔ Click **Issue Structured Referral**.
7. **Create Referral (`/asha/referral/create/p1`)**: Review structured clinical reason ➔ Click **Submit Referral**.
8. **Doctor Queue (`/doctor`)**: Switch role to **Physician** ➔ Click on Sunita Jadhav's referral card.
9. **Doctor Consultation (`/doctor/referral/r2`)**: Select **ICD-10 Code `O14.0 Mild Pre-eclampsia`** ➔ Enter clinical findings ➔ Input ASHA feedback ➔ Click **Complete Consultation**.
10. **Timeline Verification (`/asha/patient/p1`)**: View updated timeline showing completed consultation, ICD-10 diagnosis, doctor feedback, and auto-scheduled follow-up.
11. **Executive Dashboard (`/admin`)**: Switch to **Executive Suite** ➔ Observe live referral completion rate update (`78.1% ➔ 79.2%`).

---

## ⚠️ 11. Synthetic Data & Clinical Safety Disclaimer

> **Synthetic Data Notice**: All patient names, facility queues, IDs, and historical vitals displayed in this prototype are **synthetic data generated for demonstration purposes**.  
> **Clinical Safety Boundary**: CareLink AI provides clinical decision support and care routing. **Diagnosis and treatment are strictly recorded by licensed physicians.**

---

## 📊 12. Scope Classification Table

| Feature / Capability | BUILD (100% Functional) | DEMO / MOCK (Vision Layer) | ROADMAP (Future Scope) |
|---|:---:|:---:|:---:|
| **Patient Record & Timeline** | ✅ | | |
| **ASHA Field Assessment** | ✅ | | |
| **Deterministic Safety Triage** | ✅ | | |
| **Smart Facility Matcher** | ✅ | | |
| **Referral Lifecycle State Machine** | ✅ | | |
| **Physician Consultation & Feedback** | ✅ | | |
| **ICD-10 / SNOMED Coding** | ✅ | | |
| **Missed Care Follow-up Engine** | ✅ | | |
| **Dynamic Executive Dashboard** | ✅ | | |
| **100% Marathi Translation (`मराठी`)** | ✅ | | |
| **Offline Encounter Queue** | ✅ | | |
| **Village Kiosk OPD Access** | | 🟡 | |
| **Voice / IVR Telephony Webhook** | | 🟡 | |
| **Production ABDM Sandbox** | | | 🔵 |
| **Live National Telephony Gateway** | | | 🔵 |

---

## 🛠️ 13. Known Limitations & Production Readiness Assessment

1. **ABDM Health ID (ABHA) Linkage**: Prototype simulates patient IDs (`p1`, `p2`); live production deployment requires integration with the NHA ABHA Sandbox API.
2. **Telephony Integration**: IVR voice triage is simulated via TwiML XML responses (`/api/ivr/webhook`); live deployment requires active Exotel/Twilio SIP trunking.
3. **PostgreSQL Cloud Database**: Prototype includes Express file-backed DB persistence (`data/db.json`); cloud production relies on Supabase PostgreSQL.
