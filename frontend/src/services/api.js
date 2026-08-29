import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// ============================================================
// AUTH
// ============================================================
export const loginAs = (role, facilityId) => api.post('/auth/login', { role, facility_id: facilityId });
export const getWorkers = () => api.get('/auth/workers');

// ============================================================
// PATIENTS
// ============================================================
export const getPatients = (params) => api.get('/patients', { params });
export const getPatient = (id) => api.get(`/patients/${id}`);
export const getPatientTimeline = (id) => api.get(`/patients/${id}/timeline`);
export const createPatient = (data) => api.post('/patients', data);

// ============================================================
// MEDICAL RECORDS
// ============================================================
export const createRecord = (data) => api.post('/records', data);

// ============================================================
// REFERRALS
// ============================================================
export const getReferrals = (params) => api.get('/referrals', { params });
export const createReferral = (data) => api.post('/referrals', data);
export const updateReferralStatus = (id, data) => api.patch(`/referrals/${id}/status`, data);
export const addReferralFeedback = (id, data) => api.post(`/referrals/${id}/feedback`, data);

// ============================================================
// FACILITIES
// ============================================================
export const getFacilities = () => api.get('/facilities');
export const matchFacility = (params) => api.get('/facilities/match', { params });

// ============================================================
// FOLLOW-UPS
// ============================================================
export const getFollowUps = (params) => api.get('/followups', { params });
export const updateFollowUp = (id, data) => api.patch(`/followups/${id}`, data);
export const createFollowUp = (data) => api.post('/followups', data);

// ============================================================
// DASHBOARD
// ============================================================
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getDashboardTrends = () => api.get('/dashboard/trends');

// ============================================================
// OUTREACH
// ============================================================
export const getOutreachAlerts = () => api.get('/outreach/alerts');

// ============================================================
// SYNC
// ============================================================
export const syncOfflineRecords = (records) => api.post('/sync', { records });

export default api;
