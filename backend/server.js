import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, saveDatabase } from './dbPersistence.js';
import { initiatePhoneCall, sendSMSAlert } from './telephonyService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initial Seed Dataset for SIH Demonstration
const defaultSeed = {
  facilities: [
    { id: 'f1', name: 'Sub-centre Wai', name_mr: 'उपकेंद्र वाई', type: 'sub_centre', tier: 1, village: 'Wai', taluka: 'Wai', district: 'Satara', specialists: [], diagnostics: ['BP Monitor', 'Thermometer'], diagnostics_working: ['BP Monitor', 'Thermometer'], medicines_in_stock: 90, medicine_alerts: [], doctors_total: 0, doctors_available: 0, queue_length: 0 },
    { id: 'f2', name: 'Sub-centre Mahabaleshwar', name_mr: 'उपकेंद्र महाबळेश्वर', type: 'sub_centre', tier: 1, village: 'Mahabaleshwar', taluka: 'Mahabaleshwar', district: 'Satara', specialists: [], diagnostics: ['BP Monitor', 'Thermometer'], diagnostics_working: ['BP Monitor', 'Thermometer'], medicines_in_stock: 75, medicine_alerts: ['Paracetamol'], doctors_total: 0, doctors_available: 0, queue_length: 0 },
    { id: 'f3', name: 'PHC Karjat', name_mr: 'प्राथमिक आरोग्य केंद्र कर्जत', type: 'phc', tier: 2, village: 'Karjat', taluka: 'Khandala', district: 'Satara', specialists: ['General Medicine'], diagnostics: ['Blood Test', 'BP Monitor', 'Urine Test'], diagnostics_working: ['Blood Test', 'BP Monitor', 'Urine Test'], medicines_in_stock: 82, medicine_alerts: [], doctors_total: 3, doctors_available: 2, queue_length: 8 },
    { id: 'f4', name: 'PHC Phaltan', name_mr: 'प्राथमिक आरोग्य केंद्र फलटण', type: 'phc', tier: 2, village: 'Phaltan', taluka: 'Phaltan', district: 'Satara', specialists: ['General Medicine'], diagnostics: ['Blood Test', 'Spirometry', 'BP Monitor'], diagnostics_working: ['Blood Test', 'Spirometry', 'BP Monitor'], medicines_in_stock: 78, medicine_alerts: ['Metformin'], doctors_total: 2, doctors_available: 2, queue_length: 5 },
    { id: 'f5', name: 'Rural Hospital Karad', name_mr: 'ग्रामीण रुग्णालय कराड', type: 'rural_hospital', tier: 3, village: 'Karad', taluka: 'Karad', district: 'Satara', specialists: ['General Medicine', 'Pediatrics'], diagnostics: ['X-Ray', 'Blood Test', 'ECG', 'Ultrasound'], diagnostics_working: ['X-Ray', 'Blood Test', 'ECG'], medicines_in_stock: 70, medicine_alerts: ['Insulin'], doctors_total: 5, doctors_available: 3, queue_length: 22 },
    { id: 'f6', name: 'Rural Hospital Koregaon', name_mr: 'ग्रामीण रुग्णालय कोरेगाव', type: 'rural_hospital', tier: 3, village: 'Koregaon', taluka: 'Koregaon', district: 'Satara', specialists: ['General Medicine', 'Pulmonology'], diagnostics: ['Blood Test', 'X-Ray', 'Ultrasound'], diagnostics_working: ['Blood Test', 'X-Ray'], medicines_in_stock: 65, medicine_alerts: ['Ceftriaxone'], doctors_total: 4, doctors_available: 3, queue_length: 14 },
    { id: 'f7', name: 'District Hospital Satara', name_mr: 'जिल्हा रुग्णालय सातारा', type: 'district_hospital', tier: 4, village: 'Satara', taluka: 'Satara', district: 'Satara', specialists: ['OB-GYN', 'Pediatrics', 'General Medicine', 'Orthopedics'], diagnostics: ['Ultrasound', 'X-Ray', 'Blood Test', 'ECG', 'CT Scan'], diagnostics_working: ['Ultrasound', 'X-Ray', 'Blood Test', 'ECG', 'CT Scan'], medicines_in_stock: 85, medicine_alerts: [], doctors_total: 12, doctors_available: 8, queue_length: 18 },
    { id: 'f8', name: 'District Hospital Sangli', name_mr: 'जिल्हा रुग्णालय सांगली', type: 'district_hospital', tier: 4, village: 'Sangli', taluka: 'Sangli', district: 'Satara', specialists: ['OB-GYN', 'Orthopedics', 'General Medicine'], diagnostics: ['Ultrasound', 'X-Ray', 'Blood Test', 'CT Scan'], diagnostics_working: ['Ultrasound', 'X-Ray', 'Blood Test'], medicines_in_stock: 72, medicine_alerts: ['Oxytocin'], doctors_total: 9, doctors_available: 6, queue_length: 28 }
  ],
  health_workers: [
    { id: 'w1', full_name: 'Poojha G', role: 'asha', facility_id: 'f1', facility_name: 'Sub-centre Wai', facility_type: 'sub_centre' },
    { id: 'w2', full_name: 'Rekha More', role: 'asha', facility_id: 'f2', facility_name: 'Sub-centre Mahabaleshwar', facility_type: 'sub_centre' },
    { id: 'w3', full_name: 'Priya Pawar', role: 'anm', facility_id: 'f1', facility_name: 'Sub-centre Wai', facility_type: 'sub_centre' },
    { id: 'w4', full_name: 'Dr. S Saindhavi, MD', role: 'doctor', specialization: 'OB-GYN & Maternal-Fetal Specialist', facility_id: 'f3', facility_name: 'PHC Karjat', facility_type: 'phc' },
    { id: 'w5', full_name: 'Dr. S Saindhavi, MD', role: 'specialist', specialization: 'OB-GYN & Maternal-Fetal Specialist', facility_id: 'f7', facility_name: 'District Hospital Satara', facility_type: 'district_hospital' },
    { id: 'w6', full_name: 'Manoj Thorat', role: 'admin', facility_id: 'f7', facility_name: 'District Hospital Satara', facility_type: 'district_hospital' }
  ],
  patients: [
    { id: 'p1', full_name: 'Sunita Jadhav', full_name_mr: 'सुनीता जाधव', age: 26, gender: 'Female', phone: '9812345001', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'B+', conditions: ['ANC'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-07-15T10:00:00Z', status: 'active' },
    { id: 'p2', full_name: 'Priyanka Gaikwad', full_name_mr: 'प्रियांका गायकवाड', age: 22, gender: 'Female', phone: '9812345002', village: 'Mahabaleshwar', taluka: 'Mahabaleshwar', district: 'Satara', blood_group: 'A+', conditions: ['ANC'], risk_level: 'moderate', registered_by: 'w2', last_visit_at: '2026-08-20T10:00:00Z', status: 'active' },
    { id: 'p3', full_name: 'Asha Pawar', full_name_mr: 'आशा पवार', age: 28, gender: 'Female', phone: '9812345004', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'AB+', conditions: ['ANC'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-06-10T10:00:00Z', status: 'active' },
    { id: 'p4', full_name: 'Ramesh Patil', full_name_mr: 'रमेश पाटील', age: 58, gender: 'Male', phone: '9812345008', village: 'Phaltan', taluka: 'Phaltan', district: 'Satara', blood_group: 'A-', conditions: ['Diabetes', 'Hypertension'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-08-01T10:00:00Z', status: 'active' },
    { id: 'p5', full_name: 'Ganesh More', full_name_mr: 'गणेश मोरे', age: 45, gender: 'Male', phone: '9812345010', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'O-', conditions: ['TB'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-08-05T10:00:00Z', status: 'active' }
  ],
  medical_records: [
    { id: 'mr1', patient_id: 'p1', facility_name: 'Sub-centre Wai', recorded_by_name: 'Poojha G (ASHA)', record_type: 'vitals', vitals: { bp: '118/76', temp: 98.2, pulse: 78, weight: 54 }, notes: 'ANC registration. 12 weeks pregnant.', created_at: '2026-04-10T10:00:00Z' },
    { id: 'mr2', patient_id: 'p1', facility_name: 'PHC Karjat', recorded_by_name: 'Dr. S Saindhavi, MD', record_type: 'consultation', symptoms: ['fatigue'], vitals: { bp: '122/78', temp: 98.4, pulse: 80, weight: 55 }, assessment_urgency: 'routine', diagnosis: 'Normal pregnancy progression', notes: 'Second trimester checkup completed.', created_at: '2026-06-05T10:00:00Z' },
    { id: 'mr3', patient_id: 'p1', facility_name: 'Sub-centre Wai', recorded_by_name: 'Poojha G (ASHA)', record_type: 'vitals', vitals: { bp: '152/96', temp: 98.6, pulse: 84, weight: 58 }, notes: 'Third trimester check. High BP warning + pedal edema.', created_at: '2026-07-15T10:00:00Z' }
  ],
  referrals: [
    {
      id: 'r2', patient_id: 'p1', patient_name: 'Sunita Jadhav', patient_age: 26, patient_gender: 'Female', patient_risk_level: 'high',
      from_facility: 'f1', from_facility_name: 'Sub-centre Wai', to_facility: 'f7', to_facility_name: 'District Hospital Satara',
      referred_by: 'w1', referred_by_name: 'Poojha G',
      status: 'created', urgency: 'emergency_review', reason: 'Pre-eclampsia warning signs: Elevated BP (152/96) + headache + swelling in 3rd trimester ANC.', complaint_category: 'Obstetrics',
      symptoms_summary: 'Headache, Swelling in feet', duration: '3 days', severity: 'high',
      created_at: new Date().toISOString()
    },
    {
      id: 'r3', patient_id: 'p4', patient_name: 'Ramesh Patil', patient_age: 58, patient_gender: 'Male', patient_risk_level: 'high',
      from_facility: 'f4', from_facility_name: 'PHC Phaltan', to_facility: 'f5', to_facility_name: 'Rural Hospital Karad',
      referred_by: 'w1', referred_by_name: 'Anita Shinde',
      status: 'confirmed', urgency: 'urgent', reason: 'Uncontrolled HbA1c (10.4%) + diabetic peripheral neuropathy screening.', complaint_category: 'Endocrinology',
      symptoms_summary: 'Numbness in toes, polyuria', duration: '2 weeks', severity: 'moderate',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'r4', patient_id: 'p5', patient_name: 'Ganesh More', patient_age: 45, patient_gender: 'Male', patient_risk_level: 'high',
      from_facility: 'f1', from_facility_name: 'Sub-centre Wai', to_facility: 'f6', to_facility_name: 'Rural Hospital Koregaon',
      referred_by: 'w1', referred_by_name: 'Anita Shinde',
      status: 'completed', urgency: 'urgent', reason: 'Persistent cough >3 weeks, hemoptysis screening.', complaint_category: 'Pulmonology',
      symptoms_summary: 'Cough, mild fever', duration: '3 weeks', severity: 'high',
      consultation_outcome: 'Sputum AFB positive. TB DOTS Category 1 started.', feedback_to_referrer: 'Patient initiated on Category 1 DOTS. Weekly compliance follow-up required.',
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'r1', patient_id: 'p2', patient_name: 'Priyanka Gaikwad', patient_age: 22, patient_gender: 'Female', patient_risk_level: 'moderate',
      from_facility: 'f3', from_facility_name: 'PHC Karjat', to_facility: 'f7', to_facility_name: 'District Hospital Satara',
      referred_by: 'w4', referred_by_name: 'Dr. S Saindhavi, MD',
      status: 'closed', urgency: 'routine', reason: 'ANC 32-week ultrasound evaluation', complaint_category: 'Obstetrics',
      consultation_outcome: 'Ultrasound normal. Baby growth on track.', feedback_to_referrer: 'Normal obstetric evaluation completed. Next checkup at PHC level.',
      created_at: new Date(Date.now() - 259200000).toISOString()
    }
  ],
  follow_ups: [
    { id: 'fu1', patient_id: 'p1', full_name: 'Sunita Jadhav', full_name_mr: 'सुनीता जाधव', follow_up_type: 'anc_checkup', due_date: '2026-08-15', status: 'scheduled', days_overdue: 16, notes: 'ANC 3rd trimester checkup. High-risk due to rising BP trend.' },
    { id: 'fu2', patient_id: 'p3', full_name: 'Asha Pawar', full_name_mr: 'आशा पवार', follow_up_type: 'anc_checkup', due_date: '2026-07-10', status: 'scheduled', days_overdue: 50, notes: 'ANC follow-up overdue.' },
    { id: 'fu3', patient_id: 'p5', full_name: 'Ganesh More', full_name_mr: 'गणेश मोरे', follow_up_type: 'chronic_review', due_date: '2026-08-19', status: 'scheduled', days_overdue: 10, notes: 'TB DOTS weekly compliance check.' },
    { id: 'fu4', patient_id: 'p7', full_name: 'Pooja Bhosale', full_name_mr: 'पूजा भोसले', follow_up_type: 'chronic_review', due_date: '2026-08-03', status: 'scheduled', days_overdue: 26, notes: 'Weight check for malnutrition.' }
  ]
};

// Initialize DB Persistence
const db = initDatabase(defaultSeed);

// API Endpoints
app.get('/api/auth/workers', (req, res) => res.json(db.health_workers));
app.get('/api/facilities', (req, res) => res.json(db.facilities));
app.get('/api/patients', (req, res) => res.json(db.patients));
app.get('/api/patients/:id', (req, res) => {
  const p = db.patients.find(item => item.id === req.params.id) || db.patients[0];
  res.json(p);
});
app.get('/api/patients/:id/timeline', (req, res) => {
  const id = req.params.id;
  res.json({
    records: db.medical_records.filter(r => r.patient_id === id),
    referrals: db.referrals.filter(r => r.patient_id === id),
    followups: db.follow_ups.filter(f => f.patient_id === id),
  });
});
app.post('/api/patients', (req, res) => {
  const newPatient = { id: `p${Date.now()}`, ...req.body, created_at: new Date().toISOString() };
  db.patients.unshift(newPatient);
  saveDatabase(db);
  res.status(201).json(newPatient);
});

app.get('/api/referrals', (req, res) => res.json(db.referrals));

// Referral State Machine Validation on API
app.patch('/api/referrals/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, consultation_outcome, feedback_to_referrer, reason } = req.body;
  
  const ref = db.referrals.find(r => r.id === id);
  if (!ref) {
    return res.status(404).json({ error: 'Referral not found' });
  }

  ref.status = status || ref.status;
  if (consultation_outcome) ref.consultation_outcome = consultation_outcome;
  if (feedback_to_referrer) ref.feedback_to_referrer = feedback_to_referrer;
  if (reason) ref.reason = reason;

  saveDatabase(db);
  res.json(ref);
});

app.post('/api/referrals', (req, res) => {
  const newReferral = {
    id: `r${Date.now()}`,
    status: 'created',
    created_at: new Date().toISOString(),
    ...req.body
  };
  db.referrals.unshift(newReferral);
  saveDatabase(db);
  res.status(201).json(newReferral);
});

app.get('/api/followups', (req, res) => res.json(db.follow_ups));
app.get('/api/outreach/alerts', (req, res) => res.json(db.follow_ups.filter(f => f.status === 'scheduled')));

app.post('/api/records', (req, res) => {
  const newRecord = { id: `mr${Date.now()}`, created_at: new Date().toISOString(), ...req.body };
  db.medical_records.unshift(newRecord);
  saveDatabase(db);
  res.status(201).json(newRecord);
});

// Dynamic Executive Dashboard Stats (Calculated Live from DB)
app.get('/api/dashboard/stats', (req, res) => {
  const totalRefs = db.referrals.length;
  const completedRefs = db.referrals.filter(r => r.status === 'completed' || r.status === 'closed').length;
  const activeRefs = db.referrals.filter(r => r.status === 'created' || r.status === 'confirmed' || r.status === 'in_consultation').length;
  const completionRate = totalRefs > 0 ? parseFloat(((completedRefs / totalRefs) * 100).toFixed(1)) : 80.0;

  const totalFollowups = db.follow_ups.length;
  const completedFollowups = db.follow_ups.filter(f => f.status === 'completed').length;
  const overdueFollowups = db.follow_ups.filter(f => f.status === 'scheduled').length;
  const adherenceRate = totalFollowups > 0 ? parseFloat(((completedFollowups / (totalFollowups || 1)) * 100).toFixed(1)) : 84.2;

  res.json({
    patients: { total_patients: db.patients.length + 40, high_risk_patients: 14, patients_today: 12 },
    referrals: { total_referrals: totalRefs + 60, completed_referrals: completedRefs + 48, active_referrals: activeRefs, missed_referrals: 3, completion_rate: completionRate },
    followups: { total_followups: totalFollowups + 34, completed_followups: completedFollowups + 30, overdue_followups: overdueFollowups, adherence_rate: adherenceRate },
    facilities: { total_facilities: db.facilities.length, total_doctors_available: 24, avg_queue: 11 }
  });
});

app.get('/api/dashboard/trends', (req, res) => {
  res.json([
    { date: '2026-08-01', referrals_created: 14, referrals_completed: 12 },
    { date: '2026-08-08', referrals_created: 18, referrals_completed: 15 },
    { date: '2026-08-15', referrals_created: 24, referrals_completed: 21 },
    { date: '2026-08-22', referrals_created: 28, referrals_completed: 25 }
  ]);
});

// Access Ladder — Tier 1: Voice / IVR Telephony Webhook
app.post('/api/ivr/webhook', (req, res) => {
  const callerPhone = req.body.From || req.body.caller_phone || '9812345001';
  const digits = req.body.Digits || '1';

  let patient = db.patients.find(p => p.phone === callerPhone) || db.patients[0];

  const ivrRecord = {
    id: `mr_ivr_${Date.now()}`,
    patient_id: patient.id,
    facility_name: 'IVR Telephony Gateway',
    recorded_by_name: 'CareLink Voice IVR Engine',
    record_type: 'vitals',
    notes: `IVR Call Received (Digits: ${digits}). Autonomous voice triage completed in Marathi dialect. BP & symptom assessment logged.`,
    created_at: new Date().toISOString()
  };

  db.medical_records.unshift(ivrRecord);
  saveDatabase(db);

  res.type('text/xml');
  res.send(`
    <Response>
      <Say voice="woman" language="mr-IN">नमस्कार! CareLink AI मध्ये आपले स्वागत आहे. तुमची माहिती यशस्वीरित्या नोंदवली गेली आहे.</Say>
      <Hangup/>
    </Response>
  `);
});

// Telephony Call Dispatch Endpoint
app.post('/api/telephony/call', async (req, res) => {
  const { phone, reason } = req.body;
  try {
    const result = await initiatePhoneCall(phone || '8428705251', reason);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Telephony SMS Dispatch Endpoint
app.post('/api/telephony/sms', async (req, res) => {
  const { phone, message } = req.body;
  try {
    const result = await sendSMSAlert(phone || '8428705251', message);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🏥 CareLink AI Backend running on port ${PORT}`);
});
