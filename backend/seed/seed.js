import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seed() {
  console.log('🌱 Seeding SETU database...\n');

  // ============================================================
  // DROP & CREATE TABLES (correct dependency order)
  // ============================================================
  await pool.query(`
    DROP TABLE IF EXISTS activity_log CASCADE;
    DROP TABLE IF EXISTS follow_ups CASCADE;
    DROP TABLE IF EXISTS referrals CASCADE;
    DROP TABLE IF EXISTS medical_records CASCADE;
    DROP TABLE IF EXISTS patients CASCADE;
    DROP TABLE IF EXISTS health_workers CASCADE;
    DROP TABLE IF EXISTS facilities CASCADE;
  `);
  console.log('✅ Dropped existing tables');

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE facilities (
      id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name                VARCHAR(200) NOT NULL,
      name_mr             VARCHAR(200),
      type                VARCHAR(30) NOT NULL,
      tier                INTEGER NOT NULL,
      village             VARCHAR(100),
      taluka              VARCHAR(100),
      district            VARCHAR(100) DEFAULT 'Satara',
      specialists         TEXT[],
      diagnostics         TEXT[],
      diagnostics_working TEXT[],
      medicines_in_stock  INTEGER DEFAULT 80,
      medicine_alerts     TEXT[],
      doctors_total       INTEGER DEFAULT 1,
      doctors_available   INTEGER DEFAULT 1,
      queue_length        INTEGER DEFAULT 0,
      is_esanjeevani      BOOLEAN DEFAULT false,
      updated_at          TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE health_workers (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name       VARCHAR(200) NOT NULL,
      role            VARCHAR(30) NOT NULL,
      specialization  VARCHAR(100),
      facility_id     UUID REFERENCES facilities(id),
      phone           VARCHAR(15),
      is_available    BOOLEAN DEFAULT true,
      created_at      TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE patients (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name       VARCHAR(200) NOT NULL,
      full_name_mr    VARCHAR(200),
      age             INTEGER,
      gender          VARCHAR(20),
      phone           VARCHAR(15),
      village         VARCHAR(100),
      taluka          VARCHAR(100),
      district        VARCHAR(100) DEFAULT 'Satara',
      blood_group     VARCHAR(5),
      conditions      TEXT[],
      risk_level      VARCHAR(20) DEFAULT 'normal',
      registered_by   UUID REFERENCES health_workers(id),
      registered_at   TIMESTAMP DEFAULT NOW(),
      last_visit_at   TIMESTAMP,
      status          VARCHAR(20) DEFAULT 'active'
    );

    CREATE TABLE medical_records (
      id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id            UUID REFERENCES patients(id) NOT NULL,
      facility_id           UUID REFERENCES facilities(id),
      recorded_by           UUID REFERENCES health_workers(id),
      record_type           VARCHAR(30),
      symptoms              TEXT[],
      vitals                JSONB,
      red_flags_detected    TEXT[],
      assessment_urgency    VARCHAR(20),
      assessment_rationale  TEXT,
      facility_recommended  UUID REFERENCES facilities(id),
      diagnosis             TEXT,
      diagnosis_code        VARCHAR(20),
      prescription          TEXT,
      notes                 TEXT,
      created_at            TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE referrals (
      id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id            UUID REFERENCES patients(id) NOT NULL,
      from_facility         UUID REFERENCES facilities(id),
      to_facility           UUID REFERENCES facilities(id),
      referred_by           UUID REFERENCES health_workers(id),
      received_by           UUID REFERENCES health_workers(id),
      status                VARCHAR(30) DEFAULT 'created',
      urgency               VARCHAR(20),
      reason                TEXT NOT NULL,
      symptoms_summary      TEXT,
      complaint_category    VARCHAR(100),
      duration              VARCHAR(100),
      severity              VARCHAR(20),
      prior_history_summary TEXT,
      consultation_outcome  TEXT,
      feedback_to_referrer  TEXT,
      appointment_date      TIMESTAMP,
      completed_at          TIMESTAMP,
      created_at            TIMESTAMP DEFAULT NOW(),
      updated_at            TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE follow_ups (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id      UUID REFERENCES patients(id) NOT NULL,
      referral_id     UUID REFERENCES referrals(id),
      assigned_to     UUID REFERENCES health_workers(id),
      follow_up_type  VARCHAR(30),
      due_date        DATE NOT NULL,
      status          VARCHAR(20) DEFAULT 'scheduled',
      notes           TEXT,
      completed_at    TIMESTAMP,
      escalated_at    TIMESTAMP,
      created_at      TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE activity_log (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id        UUID REFERENCES health_workers(id),
      patient_id      UUID REFERENCES patients(id),
      facility_id     UUID REFERENCES facilities(id),
      action          VARCHAR(50),
      details         JSONB,
      created_at      TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Created all tables\n');

  // ============================================================
  // SEED FACILITIES
  // ============================================================
  const facilityRows = await pool.query(`
    INSERT INTO facilities (name, name_mr, type, tier, village, taluka, specialists, diagnostics, diagnostics_working, medicines_in_stock, medicine_alerts, doctors_total, doctors_available, queue_length, is_esanjeevani) VALUES
    ('Sub-centre Wai', 'उपकेंद्र वाई', 'sub_centre', 1, 'Wai', 'Wai', '{}', '{"BP Monitor", "Thermometer"}', '{"BP Monitor", "Thermometer"}', 90, '{}', 0, 0, 0, false),
    ('Sub-centre Mahabaleshwar', 'उपकेंद्र महाबळेश्वर', 'sub_centre', 1, 'Mahabaleshwar', 'Mahabaleshwar', '{}', '{"BP Monitor", "Thermometer"}', '{"BP Monitor", "Thermometer"}', 75, '{"Paracetamol"}', 0, 0, 0, false),
    ('PHC Karjat', 'प्राथमिक आरोग्य केंद्र कर्जत', 'phc', 2, 'Karjat', 'Khandala', '{"General Medicine"}', '{"Blood Test", "BP Monitor", "Urine Test"}', '{"Blood Test", "BP Monitor", "Urine Test"}', 82, '{}', 2, 1, 8, false),
    ('PHC Phaltan', 'प्राथमिक आरोग्य केंद्र फलटण', 'phc', 2, 'Phaltan', 'Phaltan', '{"General Medicine"}', '{"Blood Test", "Spirometry", "BP Monitor"}', '{"Blood Test", "Spirometry", "BP Monitor"}', 78, '{"Metformin"}', 2, 2, 5, false),
    ('Rural Hospital Karad', 'ग्रामीण रुग्णालय कराड', 'rural_hospital', 3, 'Karad', 'Karad', '{"General Medicine", "Pediatrics"}', '{"X-Ray", "Blood Test", "ECG", "Ultrasound"}', '{"X-Ray", "Blood Test", "ECG"}', 70, '{"Insulin", "Amlodipine"}', 4, 3, 22, false),
    ('Rural Hospital Koregaon', 'ग्रामीण रुग्णालय कोरेगाव', 'rural_hospital', 3, 'Koregaon', 'Koregaon', '{"General Medicine"}', '{"Blood Test", "X-Ray", "Ultrasound"}', '{"Blood Test", "X-Ray"}', 65, '{"Ceftriaxone"}', 3, 2, 14, false),
    ('District Hospital Satara', 'जिल्हा रुग्णालय सातारा', 'district_hospital', 4, 'Satara', 'Satara', '{"OB-GYN", "Pediatrics", "General Medicine", "Orthopedics"}', '{"Ultrasound", "X-Ray", "Blood Test", "ECG", "CT Scan"}', '{"Ultrasound", "X-Ray", "Blood Test", "ECG", "CT Scan"}', 85, '{}', 8, 5, 18, true),
    ('District Hospital Sangli', 'जिल्हा रुग्णालय सांगली', 'district_hospital', 4, 'Sangli', 'Sangli', '{"OB-GYN", "Orthopedics", "General Medicine"}', '{"Ultrasound", "X-Ray", "Blood Test", "CT Scan"}', '{"Ultrasound", "X-Ray", "Blood Test"}', 72, '{"Oxytocin"}', 7, 4, 28, true)
    RETURNING id, name;
  `);

  const facilities = {};
  facilityRows.rows.forEach(r => { facilities[r.name] = r.id; });
  console.log('✅ Seeded 8 facilities');

  // ============================================================
  // SEED HEALTH WORKERS
  // ============================================================
  const workerRows = await pool.query(`
    INSERT INTO health_workers (full_name, role, specialization, facility_id, phone, is_available) VALUES
    ('Anita Shinde', 'asha', NULL, $1, '9876543210', true),
    ('Rekha More', 'asha', NULL, $2, '9876543211', true),
    ('Priya Pawar', 'anm', NULL, $1, '9876543212', true),
    ('Dr. Suresh Kulkarni', 'doctor', 'General Medicine', $3, '9876543213', true),
    ('Dr. Meera Joshi', 'doctor', 'General Medicine', $4, '9876543214', true),
    ('Dr. Rajesh Deshmukh', 'doctor', 'Pediatrics', $5, '9876543215', true),
    ('Dr. Kavita Patil', 'specialist', 'OB-GYN', $7, '9876543216', true),
    ('Dr. Anil Bhosale', 'specialist', 'Pediatrics', $7, '9876543217', true),
    ('Dr. Sanjay Gaikwad', 'doctor', 'General Medicine', $7, '9876543218', true),
    ('Manoj Thorat', 'admin', NULL, $7, '9876543219', true),
    ('Dr. Sneha Chavan', 'specialist', 'OB-GYN', $8, '9876543220', true),
    ('Vijay Kale', 'admin', NULL, $5, '9876543221', true)
    RETURNING id, full_name, role;
  `, [
    facilities['Sub-centre Wai'],
    facilities['Sub-centre Mahabaleshwar'],
    facilities['PHC Karjat'],
    facilities['PHC Phaltan'],
    facilities['Rural Hospital Karad'],
    facilities['Rural Hospital Koregaon'],
    facilities['District Hospital Satara'],
    facilities['District Hospital Sangli']
  ]);

  const workers = {};
  workerRows.rows.forEach(r => { workers[r.full_name] = r.id; });
  console.log('✅ Seeded 12 health workers');

  // ============================================================
  // SEED PATIENTS
  // ============================================================
  const patientRows = await pool.query(`
    INSERT INTO patients (full_name, full_name_mr, age, gender, phone, village, taluka, blood_group, conditions, risk_level, registered_by, last_visit_at, status) VALUES
    -- ANC patients
    ('Sunita Jadhav', 'सुनीता जाधव', 26, 'Female', '9812345001', 'Wai', 'Wai', 'B+', '{"ANC"}', 'high', $1, '2026-07-15', 'active'),
    ('Priyanka Gaikwad', 'प्रियांका गायकवाड', 22, 'Female', '9812345002', 'Mahabaleshwar', 'Mahabaleshwar', 'A+', '{"ANC"}', 'moderate', $2, '2026-08-20', 'active'),
    ('Suman Kamble', 'सुमन कांबळे', 30, 'Female', '9812345003', 'Karjat', 'Khandala', 'O+', '{"ANC"}', 'normal', $1, '2026-08-25', 'active'),
    ('Asha Pawar', 'आशा पवार', 28, 'Female', NULL, 'Wai', 'Wai', 'AB+', '{"ANC"}', 'high', $1, '2026-06-10', 'active'),
    -- Children
    ('Rohit Shinde', 'रोहित शिंदे', 3, 'Male', NULL, 'Wai', 'Wai', 'B+', '{"Immunization"}', 'normal', $1, '2026-08-10', 'active'),
    ('Pooja Bhosale', 'पूजा भोसले', 1, 'Female', NULL, 'Mahabaleshwar', 'Mahabaleshwar', 'A+', '{"Immunization", "Malnutrition"}', 'high', $2, '2026-07-20', 'active'),
    ('Arjun Jagtap', 'अर्जुन जगताप', 4, 'Male', NULL, 'Koregaon', 'Koregaon', 'O+', '{"Immunization"}', 'normal', $2, '2026-08-22', 'active'),
    -- Chronic disease
    ('Ramesh Patil', 'रमेश पाटील', 58, 'Male', '9812345008', 'Phaltan', 'Phaltan', 'A-', '{"Diabetes", "Hypertension"}', 'high', $1, '2026-08-01', 'active'),
    ('Vasanti Thorat', 'वसंती थोरात', 62, 'Female', '9812345009', 'Karad', 'Karad', 'B+', '{"Hypertension"}', 'moderate', $2, '2026-08-18', 'active'),
    ('Ganesh More', 'गणेश मोरे', 45, 'Male', '9812345010', 'Wai', 'Wai', 'O-', '{"TB"}', 'high', $1, '2026-08-05', 'active'),
    ('Lata Deshmukh', 'लता देशमुख', 55, 'Female', '9812345011', 'Phaltan', 'Phaltan', 'A+', '{"Diabetes"}', 'moderate', $1, '2026-08-12', 'active'),
    -- General / routine
    ('Suraj Mane', 'सूरज माने', 35, 'Male', '9812345012', 'Wai', 'Wai', 'B+', '{}', 'normal', $1, '2026-08-28', 'active'),
    ('Deepa Salunkhe', 'दीपा साळुंखे', 40, 'Female', '9812345013', 'Mahabaleshwar', 'Mahabaleshwar', 'O+', '{}', 'normal', $2, '2026-08-26', 'active'),
    ('Vinod Kumbhar', 'विनोद कुंभार', 50, 'Male', '9812345014', 'Koregaon', 'Koregaon', 'A+', '{}', 'normal', $2, '2026-08-15', 'active'),
    -- Completed referral journey patients
    ('Meena Ghorpade', 'मीना घोरपडे', 24, 'Female', '9812345015', 'Wai', 'Wai', 'B-', '{"ANC"}', 'moderate', $1, '2026-08-22', 'active'),
    ('Akash Londhe', 'आकाश लोंढे', 7, 'Male', '9812345016', 'Karad', 'Karad', 'O+', '{}', 'normal', $2, '2026-08-20', 'active'),
    -- Active referral patients
    ('Savita Nikam', 'सविता निकम', 32, 'Female', '9812345017', 'Phaltan', 'Phaltan', 'A+', '{"ANC"}', 'high', $1, '2026-08-24', 'active'),
    ('Baburao Chavan', 'बाबूराव चव्हाण', 67, 'Male', '9812345018', 'Mahabaleshwar', 'Mahabaleshwar', 'B+', '{"Diabetes", "Hypertension"}', 'high', $2, '2026-08-23', 'active'),
    ('Ravi Jadhav', 'रवी जाधव', 42, 'Male', '9812345019', 'Wai', 'Wai', 'AB+', '{"Hypertension"}', 'moderate', $1, '2026-08-19', 'active'),
    ('Anjali Mhatre', 'अंजली म्हात्रे', 19, 'Female', '9812345020', 'Karjat', 'Khandala', 'O+', '{}', 'normal', $1, '2026-08-27', 'active')
    RETURNING id, full_name;
  `, [workers['Anita Shinde'], workers['Rekha More']]);

  const patients = {};
  patientRows.rows.forEach(r => { patients[r.full_name] = r.id; });
  console.log('✅ Seeded 20 patients');

  // ============================================================
  // SEED MEDICAL RECORDS (longitudinal history)
  // ============================================================
  await pool.query(`
    INSERT INTO medical_records (patient_id, facility_id, recorded_by, record_type, symptoms, vitals, red_flags_detected, assessment_urgency, assessment_rationale, diagnosis, diagnosis_code, notes, created_at) VALUES
    -- Sunita's history (the demo patient)
    ($1, $9, $13, 'vitals', '{}', '{"bp": "118/76", "temp": 98.2, "pulse": 78, "spo2": 99, "weight": 54}', '{}', NULL, NULL, NULL, NULL, 'ANC registration. First visit. 12 weeks pregnant.', '2026-04-10'),
    ($1, $10, $14, 'consultation', '{"fatigue", "mild_nausea"}', '{"bp": "122/78", "temp": 98.4, "pulse": 80, "spo2": 98, "weight": 55}', '{}', 'routine', 'Normal ANC progress at 20 weeks', 'Normal pregnancy progression', 'Z34.0', 'Second trimester checkup. All normal.', '2026-06-05'),
    ($1, $9, $13, 'vitals', '{}', '{"bp": "130/82", "temp": 98.6, "pulse": 82, "spo2": 98, "weight": 58}', '{}', NULL, NULL, NULL, NULL, 'Third trimester check. BP slightly elevated. Advised monitoring.', '2026-07-15'),
    -- Ramesh Patil's history (chronic patient)
    ($2, $10, $14, 'consultation', '{"fatigue", "frequent_urination"}', '{"bp": "148/92", "temp": 98.4, "pulse": 76, "spo2": 97, "weight": 78}', '{}', 'moderate', 'Uncontrolled diabetes with elevated BP', 'Type 2 Diabetes, Hypertension', 'E11.9', 'HbA1c: 8.2%. Adjusted medication.', '2026-07-01'),
    ($2, $11, $14, 'consultation', '{"numbness_feet", "fatigue"}', '{"bp": "142/88", "temp": 98.2, "pulse": 74, "spo2": 98, "weight": 77}', '{}', 'moderate', 'Peripheral neuropathy symptoms, needs specialist review', 'Diabetic neuropathy', 'G63.2', 'Referred for specialist evaluation.', '2026-08-01'),
    -- Meena's completed journey
    ($3, $9, $13, 'vitals', '{"back_pain"}', '{"bp": "124/80", "temp": 98.4, "pulse": 84, "spo2": 98, "weight": 52}', '{}', 'routine', 'Normal ANC 32 weeks', NULL, NULL, 'Routine ANC visit.', '2026-08-05'),
    ($3, $12, $15, 'consultation', '{"back_pain"}', '{"bp": "120/78", "temp": 98.2, "pulse": 80, "spo2": 99, "weight": 52}', '{}', 'routine', 'Normal obstetric evaluation', 'Normal pregnancy', 'Z34.0', 'Ultrasound normal. Baby growth on track.', '2026-08-10'),
    -- Ganesh More TB history
    ($4, $10, $14, 'consultation', '{"persistent_cough", "weight_loss", "night_sweats"}', '{"bp": "118/74", "temp": 100.2, "pulse": 88, "spo2": 95, "weight": 58}', '{"persistent_cough_gt_3weeks"}', 'urgent', 'TB symptoms — sputum test positive', 'Pulmonary TB', 'A15.0', 'Started DOTS regimen. Weekly follow-up required.', '2026-07-10'),
    -- Pooja (child malnutrition)
    ($5, $9, $13, 'vitals', '{}', '{"temp": 98.6, "pulse": 110, "spo2": 98, "weight": 6.5}', '{"underweight_for_age"}', 'moderate', 'Weight below 3rd percentile for age', 'Moderate acute malnutrition', 'E44.0', 'Nutritional counseling given. Follow-up in 2 weeks.', '2026-07-20')
    ;
  `, [
    patients['Sunita Jadhav'], patients['Ramesh Patil'], patients['Meena Ghorpade'], patients['Ganesh More'], patients['Pooja Bhosale'],
    facilities['Sub-centre Wai'],          // $6 → not used in this insert, but referenced
    facilities['Sub-centre Mahabaleshwar'],
    facilities['PHC Karjat'],
    facilities['Sub-centre Wai'],          // $9
    facilities['PHC Karjat'],              // $10
    facilities['PHC Phaltan'],             // $11
    facilities['District Hospital Satara'],// $12
    workers['Anita Shinde'],              // $13
    workers['Dr. Suresh Kulkarni'],       // $14
    workers['Dr. Kavita Patil']           // $15
  ]);
  console.log('✅ Seeded medical records');

  // ============================================================
  // SEED REFERRALS
  // ============================================================
  // Completed referral: Meena → District Hospital → completed
  const refMeena = await pool.query(`
    INSERT INTO referrals (patient_id, from_facility, to_facility, referred_by, received_by, status, urgency, reason, symptoms_summary, complaint_category, duration, severity, prior_history_summary, consultation_outcome, feedback_to_referrer, completed_at, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, 'closed', 'routine', 'ANC 32-week ultrasound evaluation', 'Back pain, routine ANC checkup', 'Obstetrics', '32 weeks gestation', 'mild', 'Normal ANC progression. Previous visits at Sub-centre Wai and PHC Karjat.', 'Ultrasound normal. Baby growth on track. Continue routine ANC at PHC.', 'Normal obstetric evaluation completed. Patient can continue care at PHC level. Next ultrasound at 36 weeks.', '2026-08-12', '2026-08-05', '2026-08-12')
    RETURNING id;
  `, [patients['Meena Ghorpade'], facilities['PHC Karjat'], facilities['District Hospital Satara'], workers['Dr. Suresh Kulkarni'], workers['Dr. Kavita Patil']]);

  // Active referral: Savita → District Hospital → confirmed
  await pool.query(`
    INSERT INTO referrals (patient_id, from_facility, to_facility, referred_by, status, urgency, reason, symptoms_summary, complaint_category, duration, severity, prior_history_summary, appointment_date, created_at)
    VALUES ($1, $2, $3, $4, 'confirmed', 'urgent', 'ANC with gestational diabetes — needs specialist monitoring', 'Elevated blood sugar, increased thirst, fatigue', 'Obstetrics', '28 weeks gestation', 'moderate', 'ANC with gestational diabetes detected at PHC. Needs OB-GYN + diabetologist review.', '2026-08-30 10:00:00', '2026-08-24');
  `, [patients['Savita Nikam'], facilities['PHC Phaltan'], facilities['District Hospital Satara'], workers['Dr. Meera Joshi']]);

  // Active referral: Baburao → Rural Hospital → created (not yet accepted)
  await pool.query(`
    INSERT INTO referrals (patient_id, from_facility, to_facility, referred_by, status, urgency, reason, symptoms_summary, complaint_category, duration, severity, prior_history_summary, created_at)
    VALUES ($1, $2, $3, $4, 'created', 'moderate', 'Uncontrolled diabetes with new peripheral neuropathy symptoms', 'Numbness in feet, tingling, fatigue, elevated BP', 'Internal Medicine', '2 weeks', 'moderate', 'Known diabetic for 10 years. Hypertension. Recent HbA1c 8.5%. New neurological symptoms.', '2026-08-23');
  `, [patients['Baburao Chavan'], facilities['Sub-centre Mahabaleshwar'], facilities['Rural Hospital Karad'], workers['Rekha More']]);

  // Missed referral: Ravi Jadhav → referred but never showed
  await pool.query(`
    INSERT INTO referrals (patient_id, from_facility, to_facility, referred_by, status, urgency, reason, symptoms_summary, complaint_category, duration, severity, created_at, updated_at)
    VALUES ($1, $2, $3, $4, 'missed', 'moderate', 'Persistent headaches with elevated BP — needs cardiology workup', 'Headaches, dizziness, BP 155/95', 'Cardiology', '3 weeks', 'moderate', '2026-08-10', '2026-08-20');
  `, [patients['Ravi Jadhav'], facilities['Sub-centre Wai'], facilities['Rural Hospital Karad'], workers['Anita Shinde']]);

  console.log('✅ Seeded referrals');

  // ============================================================
  // SEED FOLLOW-UPS (condition-specific due dates)
  // ============================================================
  await pool.query(`
    INSERT INTO follow_ups (patient_id, referral_id, assigned_to, follow_up_type, due_date, status, notes) VALUES
    -- Sunita: ANC follow-up OVERDUE (the demo trigger!)
    ($1, NULL, $9, 'anc_checkup', '2026-08-15', 'scheduled', 'ANC 3rd trimester fortnightly checkup. High-risk due to rising BP trend.'),
    -- Asha Pawar: ANC follow-up very overdue
    ($2, NULL, $9, 'anc_checkup', '2026-07-10', 'scheduled', 'ANC follow-up. No visit since June. Phone unreachable.'),
    -- Ganesh More: TB weekly follow-up overdue
    ($3, NULL, $9, 'chronic_review', '2026-08-19', 'scheduled', 'TB DOTS weekly compliance check. Must verify medication adherence.'),
    -- Rohit: Immunization due (not overdue yet)
    ($4, NULL, $9, 'immunization', '2026-09-05', 'scheduled', 'DPT booster due.'),
    -- Pooja: Malnutrition follow-up overdue
    ($5, NULL, $10, 'chronic_review', '2026-08-03', 'scheduled', 'Weight check — moderate acute malnutrition. Critical to track weight gain.'),
    -- Ramesh: Diabetes monthly review overdue
    ($6, NULL, $9, 'chronic_review', '2026-08-25', 'scheduled', 'Monthly diabetes + hypertension review. Check medication adherence.'),
    -- Meena: Post-referral follow-up completed
    ($7, $11, $9, 'post_referral', '2026-08-20', 'completed', 'Post-referral check after District Hospital ultrasound. All normal.'),
    -- Savita: Post-referral follow-up scheduled
    ($8, NULL, $9, 'post_referral', '2026-09-05', 'scheduled', 'Follow-up after District Hospital consultation for gestational diabetes.')
    ;
  `, [
    patients['Sunita Jadhav'],     // $1
    patients['Asha Pawar'],        // $2
    patients['Ganesh More'],       // $3
    patients['Rohit Shinde'],      // $4
    patients['Pooja Bhosale'],     // $5
    patients['Ramesh Patil'],      // $6
    patients['Meena Ghorpade'],    // $7
    patients['Savita Nikam'],      // $8
    workers['Anita Shinde'],       // $9
    workers['Rekha More'],         // $10
    refMeena.rows[0].id           // $11
  ]);
  console.log('✅ Seeded follow-ups');

  // ============================================================
  // SEED ACTIVITY LOG
  // ============================================================
  await pool.query(`
    INSERT INTO activity_log (actor_id, patient_id, facility_id, action, details, created_at) VALUES
    ($1, $3, $5, 'patient_registered', '{"source": "home_visit"}', '2026-04-10'),
    ($1, $3, $5, 'assessment_completed', '{"urgency": "routine"}', '2026-07-15'),
    ($2, $4, $6, 'referral_created', '{"urgency": "urgent", "to": "District Hospital Satara"}', '2026-08-05'),
    ($2, $4, $7, 'referral_completed', '{"outcome": "Normal ultrasound"}', '2026-08-12'),
    ($1, $3, $5, 'followup_overdue', '{"type": "anc_checkup", "days_overdue": 14}', '2026-08-29')
    ;
  `, [
    workers['Anita Shinde'],           // $1
    workers['Dr. Suresh Kulkarni'],    // $2
    patients['Sunita Jadhav'],         // $3
    patients['Meena Ghorpade'],        // $4
    facilities['Sub-centre Wai'],      // $5
    facilities['PHC Karjat'],          // $6
    facilities['District Hospital Satara'] // $7
  ]);
  console.log('✅ Seeded activity log');

  console.log('\n🎉 Database seeding complete!');
  console.log(`
Summary:
  - 8 facilities (2 sub-centres, 2 PHCs, 2 rural hospitals, 2 district hospitals)
  - 12 health workers (2 ASHAs, 1 ANM, 4 doctors, 3 specialists, 2 admins)
  - 20 patients (4 ANC, 3 children, 4 chronic, 6 general, 3 with referral journeys)
  - 9 medical records (longitudinal histories)
  - 4 referrals (1 closed, 1 confirmed, 1 created, 1 missed)
  - 8 follow-ups (4 overdue — triggers demo alerts!)
  - 5 activity log entries
  `);

  await pool.end();
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
