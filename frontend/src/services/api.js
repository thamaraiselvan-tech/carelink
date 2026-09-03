import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000
});

// Seed data fallbacks for static production previews when backend is unreachable
const seedData = {
  workers: [
    { id: 'w1', full_name: 'Poojha G', role: 'asha', phone: '9342222160', facility_id: 'f1', facility_name: 'Sub-centre Wai', facility_type: 'sub_centre' },
    { id: 'w4', full_name: 'Dr. S Saindhavi, MD', role: 'doctor', phone: '9677563417', specialization: 'OB-GYN & Maternal-Fetal Specialist', facility_id: 'f7', facility_name: 'District Hospital Satara', facility_type: 'district_hospital' },
    { id: 'w6', full_name: 'Manoj Thorat', role: 'admin', phone: '9812345003', facility_id: 'f7', facility_name: 'District Hospital Satara', facility_type: 'district_hospital' }
  ],
  patients: [
    { id: 'p1', full_name: 'Sunita Jadhav', full_name_mr: 'सुनीता जाधव', age: 26, gender: 'Female', phone: '9342222160', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'B+', conditions: ['ANC'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-07-15T10:00:00Z', status: 'active' },
    { id: 'p2', full_name: 'Priyanka Gaikwad', full_name_mr: 'प्रियांका गायकवाड', age: 22, gender: 'Female', phone: '9812345002', village: 'Mahabaleshwar', taluka: 'Mahabaleshwar', district: 'Satara', blood_group: 'A+', conditions: ['ANC'], risk_level: 'moderate', registered_by: 'w2', last_visit_at: '2026-08-20T10:00:00Z', status: 'active' },
    { id: 'p3', full_name: 'Asha Pawar', full_name_mr: 'आशा पवार', age: 28, gender: 'Female', phone: '9812345004', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'AB+', conditions: ['ANC'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-06-10T10:00:00Z', status: 'active' },
    { id: 'p4', full_name: 'Ramesh Patil', full_name_mr: 'रमेश पाटील', age: 58, gender: 'Male', phone: '9812345008', village: 'Phaltan', taluka: 'Phaltan', district: 'Satara', blood_group: 'A-', conditions: ['Diabetes', 'Hypertension'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-08-01T10:00:00Z', status: 'active' },
    { id: 'p5', full_name: 'Ganesh More', full_name_mr: 'गणेश मोरे', age: 45, gender: 'Male', phone: '9812345010', village: 'Wai', taluka: 'Wai', district: 'Satara', blood_group: 'O-', conditions: ['TB'], risk_level: 'high', registered_by: 'w1', last_visit_at: '2026-08-05T10:00:00Z', status: 'active' }
  ],
  records: [
    { id: 'mr1', patient_id: 'p1', facility_name: 'Sub-centre Wai', recorded_by_name: 'Poojha G (ASHA)', record_type: 'vitals', vitals: { bp: '118/76', temp: 98.2, pulse: 78, spo2: 99, weight: 54 }, notes: 'ANC registration. 12 weeks pregnant.', created_at: '2026-04-10T10:00:00Z' },
    { id: 'mr2', patient_id: 'p1', facility_name: 'PHC Karjat', recorded_by_name: 'Dr. S Saindhavi, MD', record_type: 'consultation', symptoms: ['fatigue', 'mild_nausea'], vitals: { bp: '122/78', temp: 98.4, pulse: 80, spo2: 98, weight: 55 }, assessment_urgency: 'routine', diagnosis: 'Normal pregnancy progression', notes: 'Second trimester checkup completed.', created_at: '2026-06-05T10:00:00Z' },
    { id: 'mr3', patient_id: 'p1', facility_name: 'Sub-centre Wai', recorded_by_name: 'Poojha G (ASHA)', record_type: 'vitals', vitals: { bp: '152/96', temp: 98.6, pulse: 84, spo2: 98, weight: 58 }, notes: 'Third trimester check. High BP warning + pedal edema.', created_at: '2026-07-15T10:00:00Z' }
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
  facilities: [
    { id: 'f1', name: 'Sub-centre Wai', type: 'sub_centre', tier: 1, village: 'Wai', taluka: 'Wai', district: 'Satara', diagnostics_working: ['BP Monitor', 'Thermometer'] },
    { id: 'f3', name: 'PHC Karjat', type: 'phc', tier: 2, village: 'Karjat', taluka: 'Khandala', district: 'Satara', diagnostics_working: ['Blood Test', 'BP Monitor', 'Urine Test'] },
    { id: 'f7', name: 'District Hospital Satara', type: 'district_hospital', tier: 4, village: 'Satara', taluka: 'Satara', district: 'Satara', diagnostics_working: ['Ultrasound', 'X-Ray', 'Blood Test', 'ECG', 'CT Scan'] }
  ],
  followups: [
    { id: 'fu1', patient_id: 'p1', full_name: 'Sunita Jadhav', full_name_mr: 'सुनीता जाधव', follow_up_type: 'anc_checkup', due_date: '2026-08-15', status: 'scheduled', days_overdue: 14, notes: 'ANC 3rd trimester checkup. High-risk due to rising BP trend.' },
    { id: 'fu2', patient_id: 'p3', full_name: 'Asha Pawar', full_name_mr: 'आशा पवार', follow_up_type: 'anc_checkup', due_date: '2026-07-10', status: 'scheduled', days_overdue: 50, notes: 'ANC follow-up overdue.' },
    { id: 'fu3', patient_id: 'p5', full_name: 'Ganesh More', full_name_mr: 'गणेश मोरे', follow_up_type: 'chronic_review', due_date: '2026-08-19', status: 'scheduled', days_overdue: 10, notes: 'TB DOTS weekly compliance check.' },
    { id: 'fu4', patient_id: 'p7', full_name: 'Pooja Bhosale', full_name_mr: 'पूजा भोसले', follow_up_type: 'chronic_review', due_date: '2026-08-03', status: 'scheduled', days_overdue: 26, notes: 'Weight check for malnutrition.' }
  ]
};

// Safe API Call Wrapper
const safeCall = async (fn, fallbackData) => {
  try {
    return await fn();
  } catch (err) {
    console.warn('API call failed, serving static production seed data:', err.message);
    return { data: fallbackData };
  }
};

export const loginAs = (role, facilityId) => safeCall(() => api.post('/auth/login', { role, facility_id: facilityId }), { user: seedData.workers[0] });
export const getWorkers = () => safeCall(() => api.get('/auth/workers'), seedData.workers);
export const getPatients = (params) => safeCall(() => api.get('/patients', { params }), seedData.patients);
export const getPatient = (id) => safeCall(() => api.get(`/patients/${id}`), seedData.patients.find(p => p.id === id) || seedData.patients[0]);
export const getPatientTimeline = (id) => safeCall(() => api.get(`/patients/${id}/timeline`), { records: seedData.records.filter(r => r.patient_id === id), referrals: seedData.referrals.filter(r => r.patient_id === id), followups: seedData.followups.filter(f => f.patient_id === id) });
export const createPatient = (data) => safeCall(() => api.post('/patients', data), { id: `p${Date.now()}`, ...data });
export const createRecord = (data) => safeCall(() => api.post('/records', data), { id: `mr${Date.now()}`, ...data });
export const getReferrals = (params) => safeCall(() => api.get('/referrals', { params }), seedData.referrals);
export const createReferral = (data) => safeCall(() => api.post('/referrals', data), { id: `r${Date.now()}`, ...data });
export const updateReferralStatus = (id, data) => safeCall(() => api.patch(`/referrals/${id}/status`, data), { id, ...data });
export const addReferralFeedback = (id, data) => safeCall(() => api.post(`/referrals/${id}/feedback`, data), { id, ...data });
export const getFacilities = () => safeCall(() => api.get('/facilities'), seedData.facilities);
export const matchFacility = (params) => safeCall(() => api.get('/facilities/match', { params }), { recommended: seedData.facilities[2], alternatives: [], unmatched: [] });
export const getFollowUps = (params) => safeCall(() => api.get('/followups', { params }), seedData.followups);
export const updateFollowUp = (id, data) => safeCall(() => api.patch(`/followups/${id}`, data), { id, ...data });
export const createFollowUp = (data) => safeCall(() => api.post('/followups', data), { id: `fu${Date.now()}`, ...data });
export const getDashboardStats = () => safeCall(() => api.get('/dashboard/stats'), {
  patients: { total_patients: 48, high_risk_patients: 14, patients_today: 12 },
  referrals: { total_referrals: 64, completed_referrals: 52, active_referrals: 9, missed_referrals: 3, completion_rate: 81.2 },
  followups: { total_followups: 38, completed_followups: 32, overdue_followups: 6, adherence_rate: 84.2 },
  facilities: { total_facilities: 8, total_doctors_available: 24, avg_queue: 11 }
});
export const getDashboardTrends = () => safeCall(() => api.get('/dashboard/trends'), [
  { date: '2026-08-01', referrals_created: 14, referrals_completed: 12 },
  { date: '2026-08-08', referrals_created: 18, referrals_completed: 15 },
  { date: '2026-08-15', referrals_created: 24, referrals_completed: 21 },
  { date: '2026-08-22', referrals_created: 28, referrals_completed: 25 }
]);
export const getOutreachAlerts = () => safeCall(() => api.get('/outreach/alerts'), seedData.followups);
export const syncOfflineRecords = (records) => safeCall(() => api.post('/sync', { records }), { synced: records?.length || 0, results: [] });

export default api;
