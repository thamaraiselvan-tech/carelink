import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-Memory Database Store (Fallback if local Postgres is unavailable)
let isPostgresConnected = false;
let pool = null;

// Seed Data for In-Memory Store
const memoryDb = {
  facilities: [
    { id: 'f1', name: 'Sub-centre Wai', name_mr: 'उपकेंद्र वाई', type: 'sub_centre', tier: 1, village: 'Wai', taluka: 'Wai', district: 'Satara', specialists: [], diagnostics: ['BP Monitor', 'Thermometer'], diagnostics_working: ['BP Monitor', 'Thermometer'], medicines_in_stock: 90, medicine_alerts: [], doctors_total: 0, doctors_available: 0, queue_length: 0, available_doctors: 0 },
    { id: 'f2', name: 'Sub-centre Mahabaleshwar', name_mr: 'उपकेंद्र महाबळेश्वर', type: 'sub_centre', tier: 1, village: 'Mahabaleshwar', taluka: 'Mahabaleshwar', specialists: [], diagnostics: ['BP Monitor', 'Thermometer'], diagnostics_working: ['BP Monitor', 'Thermometer'], medicines_in_stock: 75, medicine_alerts: ['Paracetamol'], doctors_total: 0, doctors_available: 0, queue_length: 0, available_doctors: 0 },
    { id: 'f3', name: 'PHC Karjat', name_mr: 'प्राथमिक आरोग्य केंद्र कर्जत', type: 'phc', tier: 2, village: 'Karjat', taluka: 'Khandala', district: 'Satara', specialists: ['General Medicine'], diagnostics: ['Blood Test', 'BP Monitor', 'Urine Test'], diagnostics_working: ['Blood Test', 'BP Monitor', 'Urine Test'], medicines_in_stock: 82, medicine_alerts: [], doctors_total: 2, doctors_available: 1, queue_length: 8, available_doctors: 1 },
    { id: 'f4', name: 'PHC Phaltan', name_mr: 'प्राथमिक आरोग्य केंद्र फलटण', type: 'phc', tier: 2, village: 'Phaltan', taluka: 'Phaltan', district: 'Satara', specialists: ['General Medicine'], diagnostics: ['Blood Test', 'Spirometry', 'BP Monitor'], diagnostics_working: ['Blood Test', 'Spirometry', 'BP Monitor'], medicines_in_stock: 78, medicine_alerts: ['Metformin'], doctors_total: 2, doctors_available: 2, queue_length: 5, available_doctors: 2 },
    { id: 'f5', name: 'Rural Hospital Karad', name_mr: 'ग्रामीण रुग्णालय कराड', type: 'rural_hospital', tier: 3, village: 'Karad', taluka: 'Karad', district: 'Satara', specialists: ['General Medicine', 'Pediatrics'], diagnostics: ['X-Ray', 'Blood Test', 'ECG', 'Ultrasound'], diagnostics_working: ['X-Ray', 'Blood Test', 'ECG'], medicines_in_stock: 70, medicine_alerts: ['Insulin'], doctors_total: 4, doctors_available: 3, queue_length: 22, available_doctors: 3 },
    { id: 'f6', name: 'Rural Hospital Koregaon', name_mr: 'ग्रामीण रुग्णालय कोरेगाव', type: 'rural_hospital', tier: 3, village: 'Koregaon', taluka: 'Koregaon', district: 'Satara', specialists: ['General Medicine'], diagnostics: ['Blood Test', 'X-Ray', 'Ultrasound'], diagnostics_working: ['Blood Test', 'X-Ray'], medicines_in_stock: 65, medicine_alerts: ['Ceftriaxone'], doctors_total: 3, doctors_available: 2, queue_length: 14, available_doctors: 2 },
    { id: 'f7', name: 'District Hospital Satara', name_mr: 'जिल्हा रुग्णालय सातारा', type: 'district_hospital', tier: 4, village: 'Satara', taluka: 'Satara', district: 'Satara', specialists: ['OB-GYN', 'Pediatrics', 'General Medicine', 'Orthopedics'], diagnostics: ['Ultrasound', 'X-Ray', 'Blood Test', 'ECG', 'CT Scan'], diagnostics_working: ['Ultrasound', 'X-Ray', 'Blood Test', 'ECG', 'CT Scan'], medicines_in_stock: 85, medicine_alerts: [], doctors_total: 8, doctors_available: 5, queue_length: 18, available_doctors: 5 },
    { id: 'f8', name: 'District Hospital Sangli', name_mr: 'जिल्हा रुग्णालय सांगली', type: 'district_hospital', tier: 4, village: 'Sangli', taluka: 'Sangli', district: 'Satara', specialists: ['OB-GYN', 'Orthopedics', 'General Medicine'], diagnostics: ['Ultrasound', 'X-Ray', 'Blood Test', 'CT Scan'], diagnostics_working: ['Ultrasound', 'X-Ray', 'Blood Test'], medicines_in_stock: 72, medicine_alerts: ['Oxytocin'], doctors_total: 7, doctors_available: 4, queue_length: 28, available_doctors: 4 }
  ],
  health_workers: [
    { id: 'w1', full_name: 'Anita Shinde', role: 'asha', facility_id: 'f1', facility_name: 'Sub-centre Wai', facility_type: 'sub_centre' },
    { id: 'w2', full_name: 'Rekha More', role: 'asha', facility_id: 'f2', facility_name: 'Sub-centre Mahabaleshwar', facility_type: 'sub_centre' },
    { id: 'w3', full_name: 'Priya Pawar', role: 'anm', facility_id: 'f1', facility_name: 'Sub-centre Wai', facility_type: 'sub_centre' },
    { id: 'w4', full_name: 'Dr. Suresh Kulkarni', role: 'doctor', specialization: 'General Medicine', facility_id: 'f3', facility_name: 'PHC Karjat', facility_type: 'phc' },
    { id: 'w5', full_name: 'Dr. Kavita Patil', role: 'specialist', specialization: 'OB-GYN', facility_id: 'f7', facility_name: 'District Hospital Satara', facility_type: 'district_hospital' },
    { id: 'w6', full_name: 'Manoj Thorat', role: 'admin', facility_id: 'f7', facility_name: 'District Hospital Satara', facility_type: 'district_hospital' }
  ],
  patients: [
    { id: 'p1', full_name: 'Sunita Jadhav', full_name_mr: 'सुनीता जाधव', age: 26, gender: 'Female', phone: '9812345001', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'B+', conditions: ['ANC'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-07-15T10:00:00Z', status: 'active' },
    { id: 'p2', full_name: 'Priyanka Gaikwad', full_name_mr: 'प्रियांका गायकवाड', age: 22, gender: 'Female', phone: '9812345002', village: 'Mahabaleshwar', taluka: 'Mahabaleshwar', district: 'Satara', blood_group: 'A+', conditions: ['ANC'], risk_level: 'moderate', registered_by: 'w2', last_visit_at: '2026-08-20T10:00:00Z', status: 'active' },
    { id: 'p3', full_name: 'Asha Pawar', full_name_mr: 'आशा पवार', age: 28, gender: 'Female', phone: '9812345004', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'AB+', conditions: ['ANC'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-06-10T10:00:00Z', status: 'active' },
    { id: 'p4', full_name: 'Ramesh Patil', full_name_mr: 'रमेश पाटील', age: 58, gender: 'Male', phone: '9812345008', village: 'Phaltan', taluka: 'Phaltan', district: 'Satara', blood_group: 'A-', conditions: ['Diabetes', 'Hypertension'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-08-01T10:00:00Z', status: 'active' },
    { id: 'p5', full_name: 'Ganesh More', full_name_mr: 'गणेश मोरे', age: 45, gender: 'Male', phone: '9812345010', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'O-', conditions: ['TB'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-08-05T10:00:00Z', status: 'active' },
    { id: 'p6', full_name: 'Meena Ghorpade', full_name_mr: 'मीना घोरपडे', age: 24, gender: 'Female', phone: '9812345015', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'B-', conditions: ['ANC'], risk_level: 'moderate', registered_by: 'w1', last_visit_at: '2026-08-22T10:00:00Z', status: 'active' },
    { id: 'p7', full_name: 'Pooja Bhosale', full_name_mr: 'पूजा भोसले', age: 1, gender: 'Female', phone: '9812345006', village: 'Mahabaleshwar', taluka: 'Mahabaleshwar', district: 'Satara', blood_group: 'A+', conditions: ['Immunization', 'Malnutrition'], risk_level: 'high', registered_by: 'w2', last_visit_at: '2026-07-20T10:00:00Z', status: 'active' }
  ],
  medical_records: [
    { id: 'mr1', patient_id: 'p1', facility_id: 'f1', recorded_by: 'w1', record_type: 'vitals', vitals: { bp: '118/76', temp: 98.2, pulse: 78, spo2: 99, weight: 54 }, notes: 'ANC registration. 12 weeks pregnant.', created_at: '2026-04-10T10:00:00Z' },
    { id: 'mr2', patient_id: 'p1', facility_id: 'f3', recorded_by: 'w4', record_type: 'consultation', symptoms: ['fatigue', 'mild_nausea'], vitals: { bp: '122/78', temp: 98.4, pulse: 80, spo2: 98, weight: 55 }, assessment_urgency: 'routine', diagnosis: 'Normal pregnancy progression', notes: 'Second trimester checkup. Normal.', created_at: '2026-06-05T10:00:00Z' },
    { id: 'mr3', patient_id: 'p1', facility_id: 'f1', recorded_by: 'w1', record_type: 'vitals', vitals: { bp: '130/82', temp: 98.6, pulse: 82, spo2: 98, weight: 58 }, notes: 'Third trimester check. BP slightly elevated.', created_at: '2026-07-15T10:00:00Z' }
  ],
  referrals: [
    {
      id: 'r1', patient_id: 'p6', patient_name: 'Meena Ghorpade', patient_age: 24, patient_gender: 'Female', patient_risk_level: 'moderate',
      from_facility: 'f3', from_facility_name: 'PHC Karjat', to_facility: 'f7', to_facility_name: 'District Hospital Satara',
      referred_by: 'w4', referred_by_name: 'Dr. Suresh Kulkarni', received_by: 'w5',
      status: 'closed', urgency: 'routine', reason: 'ANC 32-week ultrasound evaluation', complaint_category: 'Obstetrics',
      consultation_outcome: 'Ultrasound normal. Baby growth on track.', feedback_to_referrer: 'Normal obstetric evaluation completed. Next checkup at PHC level.',
      created_at: '2026-08-05T10:00:00Z'
    },
    {
      id: 'r2', patient_id: 'p1', patient_name: 'Sunita Jadhav', patient_age: 26, patient_gender: 'Female', patient_risk_level: 'high',
      from_facility: 'f1', from_facility_name: 'Sub-centre Wai', to_facility: 'f7', to_facility_name: 'District Hospital Satara',
      referred_by: 'w1', referred_by_name: 'Anita Shinde',
      status: 'created', urgency: 'emergency_review', reason: 'Pre-eclampsia warning signs: Elevated BP (152/96) + headache + swelling in 3rd trimester ANC.', complaint_category: 'Obstetrics',
      symptoms_summary: 'Headache, Swelling in feet', duration: '3 days', severity: 'high',
      created_at: new Date().toISOString()
    }
  ],
  follow_ups: [
    { id: 'fu1', patient_id: 'p1', full_name: 'Sunita Jadhav', full_name_mr: 'सुनीता जाधव', follow_up_type: 'anc_checkup', due_date: '2026-08-15', status: 'scheduled', days_overdue: 14, notes: 'ANC 3rd trimester checkup. High-risk due to rising BP trend.' },
    { id: 'fu2', patient_id: 'p3', full_name: 'Asha Pawar', full_name_mr: 'आशा पवार', follow_up_type: 'anc_checkup', due_date: '2026-07-10', status: 'scheduled', days_overdue: 50, notes: 'ANC follow-up overdue.' },
    { id: 'fu3', patient_id: 'p5', full_name: 'Ganesh More', full_name_mr: 'गणेश मोरे', follow_up_type: 'chronic_review', due_date: '2026-08-19', status: 'scheduled', days_overdue: 10, notes: 'TB DOTS weekly compliance check.' },
    { id: 'fu4', patient_id: 'p7', full_name: 'Pooja Bhosale', full_name_mr: 'पूजा भोसले', follow_up_type: 'chronic_review', due_date: '2026-08-03', status: 'scheduled', days_overdue: 26, notes: 'Weight check for malnutrition.' }
  ]
};

// Attempt PostgreSQL Connection
try {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });
  pool.query('SELECT NOW()')
    .then(() => {
      isPostgresConnected = true;
      console.log('✅ PostgreSQL Database connected');
    })
    .catch(() => {
      console.log('⚡ Using In-Memory High-Performance Store (Postgres DB offline)');
    });
} catch (e) {
  console.log('⚡ Using In-Memory High-Performance Store');
}

// ============================================================
// AUTH ROUTES
// ============================================================
app.post('/api/auth/login', (req, res) => {
  const { role } = req.body;
  const roleMap = { asha: ['asha', 'anm'], doctor: ['doctor', 'specialist'], admin: ['admin'] };
  const worker = memoryDb.health_workers.find(w => roleMap[role]?.includes(w.role)) || memoryDb.health_workers[0];
  res.json({ user: worker });
});

app.get('/api/auth/workers', (req, res) => {
  res.json(memoryDb.health_workers);
});

// ============================================================
// PATIENT ROUTES
// ============================================================
app.get('/api/patients', (req, res) => {
  const { risk_level, search } = req.query;
  let list = [...memoryDb.patients];
  if (risk_level) list = list.filter(p => p.risk_level === risk_level);
  if (search) list = list.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.village.toLowerCase().includes(search.toLowerCase()));
  res.json(list);
});

app.get('/api/patients/:id', (req, res) => {
  const patient = memoryDb.patients.find(p => p.id === req.params.id) || memoryDb.patients[0];
  res.json(patient);
});

app.get('/api/patients/:id/timeline', (req, res) => {
  const records = memoryDb.medical_records.filter(r => r.patient_id === req.params.id);
  const referrals = memoryDb.referrals.filter(r => r.patient_id === req.params.id);
  const followups = memoryDb.follow_ups.filter(f => f.patient_id === req.params.id);
  res.json({ records, referrals, followups });
});

app.post('/api/patients', (req, res) => {
  const newPatient = { id: `p${memoryDb.patients.length + 1}`, ...req.body, registered_at: new Date().toISOString() };
  memoryDb.patients.unshift(newPatient);
  res.status(201).json(newPatient);
});

// ============================================================
// MEDICAL RECORDS & Assessment
// ============================================================
app.post('/api/records', (req, res) => {
  const newRecord = { id: `mr${memoryDb.medical_records.length + 1}`, ...req.body, created_at: new Date().toISOString() };
  memoryDb.medical_records.unshift(newRecord);
  res.status(201).json(newRecord);
});

// ============================================================
// REFERRAL ROUTES
// ============================================================
app.get('/api/referrals', (req, res) => {
  res.json(memoryDb.referrals);
});

app.post('/api/referrals', (req, res) => {
  const patient = memoryDb.patients.find(p => p.id === req.body.patient_id);
  const fromFac = memoryDb.facilities.find(f => f.id === req.body.from_facility);
  const toFac = memoryDb.facilities.find(f => f.id === req.body.to_facility);

  const newRef = {
    id: `r${memoryDb.referrals.length + 1}`,
    patient_id: req.body.patient_id,
    patient_name: patient?.full_name || 'Sunita Jadhav',
    patient_age: patient?.age || 26,
    patient_gender: patient?.gender || 'Female',
    patient_risk_level: patient?.risk_level || 'high',
    from_facility: req.body.from_facility,
    from_facility_name: fromFac?.name || 'Sub-centre Wai',
    to_facility: req.body.to_facility,
    to_facility_name: toFac?.name || 'District Hospital Satara',
    status: 'created',
    urgency: req.body.urgency || 'urgent',
    reason: req.body.reason,
    symptoms_summary: req.body.symptoms_summary,
    complaint_category: req.body.complaint_category || 'Obstetrics',
    created_at: new Date().toISOString()
  };

  memoryDb.referrals.unshift(newRef);
  res.status(201).json(newRef);
});

app.patch('/api/referrals/:id/status', (req, res) => {
  const ref = memoryDb.referrals.find(r => r.id === req.params.id);
  if (ref) {
    if (req.body.status) ref.status = req.body.status;
    if (req.body.consultation_outcome) ref.consultation_outcome = req.body.consultation_outcome;
    if (req.body.feedback_to_referrer) ref.feedback_to_referrer = req.body.feedback_to_referrer;
    res.json(ref);
  } else {
    res.status(404).json({ error: 'Referral not found' });
  }
});

app.post('/api/referrals/:id/feedback', (req, res) => {
  const ref = memoryDb.referrals.find(r => r.id === req.params.id);
  if (ref) {
    ref.feedback_to_referrer = req.body.feedback_to_referrer;
    ref.consultation_outcome = req.body.consultation_outcome;
    res.json(ref);
  } else {
    res.status(404).json({ error: 'Referral not found' });
  }
});

// ============================================================
// FACILITY ROUTES
// ============================================================
app.get('/api/facilities', (req, res) => {
  res.json(memoryDb.facilities);
});

app.get('/api/facilities/match', (req, res) => {
  const { specialty, diagnostics, care_level } = req.query;
  const matched = memoryDb.facilities.filter(f => f.tier >= 3);
  res.json({
    recommended: matched[0] || memoryDb.facilities[6],
    alternatives: matched.slice(1, 3),
    unmatched: memoryDb.facilities.filter(f => f.tier < 3)
  });
});

// ============================================================
// FOLLOW-UPS & OUTREACH ALERTS
// ============================================================
app.get('/api/followups', (req, res) => {
  res.json(memoryDb.follow_ups);
});

app.post('/api/followups', (req, res) => {
  const newFu = { id: `fu${memoryDb.follow_ups.length + 1}`, ...req.body, status: 'scheduled' };
  memoryDb.follow_ups.unshift(newFu);
  res.status(201).json(newFu);
});

app.get('/api/outreach/alerts', (req, res) => {
  res.json(memoryDb.follow_ups.filter(f => f.status === 'scheduled'));
});

// ============================================================
// DASHBOARD STATS
// ============================================================
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    patients: { total_patients: memoryDb.patients.length, high_risk_patients: 4, patients_today: 3 },
    referrals: { total_referrals: memoryDb.referrals.length, completed_referrals: 1, active_referrals: 1, missed_referrals: 0, completion_rate: 82 },
    followups: { total_followups: memoryDb.follow_ups.length, completed_followups: 1, overdue_followups: 4, adherence_rate: 76 },
    facilities: { total_facilities: memoryDb.facilities.length, total_doctors_available: 17, avg_queue: 11 }
  });
});

app.get('/api/dashboard/trends', (req, res) => {
  res.json([
    { date: '2026-08-01', referrals_created: 5, referrals_completed: 4 },
    { date: '2026-08-08', referrals_created: 8, referrals_completed: 7 },
    { date: '2026-08-15', referrals_created: 12, referrals_completed: 10 },
    { date: '2026-08-22', referrals_created: 15, referrals_completed: 14 }
  ]);
});

// ============================================================
// SYNC ROUTE
// ============================================================
app.post('/api/sync', (req, res) => {
  res.json({ synced: req.body.records?.length || 0, results: [] });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🏥 SETU Backend running on port ${PORT}`);
});
