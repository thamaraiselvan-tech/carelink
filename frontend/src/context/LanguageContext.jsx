import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    patients: 'Patients',
    patient: 'Patient',
    symptoms: 'Symptoms',
    headache: 'Headache',
    fever: 'Fever',
    swelling: 'Swelling',
    breathlessness: 'Breathlessness',
    cough: 'Cough',
    chest_pain: 'Chest Pain',
    abdominal_pain: 'Abdominal Pain',
    fatigue: 'Fatigue',
    blood_pressure: 'Blood Pressure',
    vitals: 'Vitals',
    temperature: 'Temperature',
    pulse: 'Pulse',
    weight: 'Weight',
    urgency: 'Urgency',
    referral: 'Referral',
    referrals: 'Referrals',
    follow_up: 'Follow-up',
    follow_ups: 'Follow-ups',
    completed: 'Completed',
    overdue: 'Overdue',
    scheduled: 'Scheduled',
    appointment: 'Appointment',
    self_care: 'Self-care',
    emergency: 'Emergency',
    available: 'Available',
    not_available: 'Not Available',
    dashboard: 'Dashboard',
    facility: 'Facility',
    facilities: 'Facilities',
    triage: 'Assessment',
    create_referral: 'Create Referral',
    view_patient: 'View Patient',
    accept: 'Accept',
    complete: 'Complete',
    routine: 'Routine',
    urgent: 'Urgent',
    emergency_review: 'Emergency Review',
    red_flag_detected: 'Red-flag detected',
    clinical_evaluation: 'Clinical evaluation required',
    decision_support_disclaimer: 'This is decision support for the health worker, not a diagnosis. Health worker verification required before action.',
    synthetic_data_notice: 'Prototype uses synthetic patient and facility data for demonstration purposes.',
    proactive_outreach: 'Proactive Outreach',
    overdue_followups: 'Overdue Follow-ups',
    no_patient_lost: 'No patient gets lost between facilities',
  },
  mr: {
    patients: 'रुग्ण',
    patient: 'रुग्ण',
    symptoms: 'लक्षणे',
    headache: 'डोकेदुखी',
    fever: 'ताप',
    swelling: 'सूज',
    breathlessness: 'श्वास घेण्यास त्रास',
    cough: 'खोकला',
    chest_pain: 'छातीत दुखणे',
    abdominal_pain: 'पोटदुखी',
    fatigue: 'थकवा',
    blood_pressure: 'रक्तदाब',
    vitals: 'जीवनावश्यक चिन्हे',
    temperature: 'तापमान',
    pulse: 'नाडी',
    weight: 'वजन',
    urgency: 'तातडी',
    referral: 'संदर्भ',
    referrals: 'संदर्भ',
    follow_up: 'पाठपुरावा',
    follow_ups: 'पाठपुरावा',
    completed: 'पूर्ण',
    overdue: 'अतिदेय',
    scheduled: 'नियोजित',
    appointment: 'भेटीची वेळ',
    self_care: 'स्वत: काळजी',
    emergency: 'आणीबाणी',
    available: 'उपलब्ध',
    not_available: 'अनुपलब्ध',
    dashboard: 'डॅशबोर्ड',
    facility: 'आरोग्य सुविधा',
    facilities: 'आरोग्य सुविधा',
    triage: 'मूल्यांकन',
    create_referral: 'संदर्भ तयार करा',
    view_patient: 'रुग्ण पहा',
    accept: 'स्वीकारा',
    complete: 'पूर्ण करा',
    routine: 'नियमित',
    urgent: 'तातडीचे',
    emergency_review: 'आणीबाणी पुनरावलोकन',
    red_flag_detected: 'रेड-फ्लॅग आढळला',
    clinical_evaluation: 'वैद्यकीय मूल्यांकन आवश्यक',
    decision_support_disclaimer: 'हे आरोग्य कर्मचाऱ्यांसाठी निर्णय समर्थन आहे, निदान नाही. कृती करण्यापूर्वी आरोग्य कर्मचाऱ्याची पडताळणी आवश्यक आहे.',
    synthetic_data_notice: 'प्रोटोटाइप प्रात्यक्षिक उद्देशांसाठी सिंथेटिक रुग्ण आणि सुविधा डेटा वापरतो.',
    proactive_outreach: 'सक्रिय आउटरीच',
    overdue_followups: 'अतिदेय पाठपुरावा',
    no_patient_lost: 'कोणताही रुग्ण सुविधांमध्ये हरवत नाही',
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en' ? 'mr' : 'en');
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
}
