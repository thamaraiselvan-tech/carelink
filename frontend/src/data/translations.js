export const translations = {
  en: {
    // General App & Navigation
    app_name: 'CareLink AI',
    app_subtitle: 'Digital Care-Coordination Layer',
    connected: 'Connected',
    offline: 'Offline',
    logout: 'Logout',
    launch_portal: 'LAUNCH PORTAL',
    active_user: 'Active User',
    exit_portal: 'Exit Portal',

    // Suites & Roles
    asha_suite: 'ASHA / ANM Suite',
    asha_badge: 'Frontline Field App',
    doctor_suite: 'Physician Suite',
    doctor_badge: 'Facility Care',
    executive_suite: 'Executive Suite',
    executive_badge: 'Quality & Governance',
    kiosk_suite: 'Village Kiosk Mode',
    kiosk_badge: 'Public Self-Check',
    patient_suite: 'Patient OPD Portal',
    patient_badge: 'Personal Care',

    // Sidebar & Navigation Links
    my_patients: 'My Patients',
    referral_tracker: 'Referral Tracker',
    incoming_referrals: 'Incoming Referrals',
    quality_dashboard: 'Quality Dashboard',

    // Buttons & Actions
    start_new_visit: 'Start New Visit & Digital Triage',
    initiate_visit: 'Initiate Visit',
    back_to_queue: 'Back to Doctor Queue',
    back_to_patients: 'Back to Patients',
    start_triage_assessment: 'Start Triage Assessment',
    accept_referral: 'Accept Referral & Confirm Slot',
    complete_consultation: 'Complete Consultation & Submit Feedback Loop',
    re_route_referral: 'Wrong Specialty → Re-route',
    end_session: 'End Session',
    start_session: 'Start Private Health Check',
    submit_assessment: 'Submit Self-Check Assessment',
    cancel_assessment: 'Cancel Assessment',

    // Labels & Placeholders
    search_patient_placeholder: 'Search patient by name or village...',
    token_input_label: 'Enter Token / Ration Card ID (Optional)',
    consultation_outcome_label: 'Consultation Outcome / Diagnosis',
    feedback_label: 'Feedback-on-Record Back to Referring ASHA/ANM',
    icd10_label: 'ICD-10 / SNOMED Diagnosis Code',
    symptom_intake_title: 'Symptom Intake & Voice Input',
    vitals_title: 'Record Patient Vitals',
    longitudinal_patient_journey: 'Longitudinal Patient Journey Record Across Facilities',
    overdue_followup_count: 'overdue follow-up(s)',

    // Status Badges & Risk Levels
    risk_normal: 'Normal risk',
    risk_moderate: 'Moderate risk',
    risk_high: 'High risk',
    risk_critical: 'Critical risk',
    status_created: 'Created',
    status_notified: 'Notified',
    status_confirmed: 'Confirmed',
    status_in_consultation: 'In Consultation',
    status_completed: 'Completed',
    status_closed: 'Closed',
    status_re_referred: 'Re-Routed',

    // Urgency Tiers
    urgency_routine: 'Routine Care',
    urgency_urgent: 'Urgent Care',
    urgency_emergency_review: 'Emergency Review Required',

    // Dashboard Metrics
    referral_completion_rate: 'Referral Completion Rate',
    followup_adherence: 'Follow-Up Adherence',
    tracked_high_risk: 'Tracked High-Risk Patients',
    doctors_available: 'Doctors Available On-Duty',
    closed_loop_cases: 'Closed-Loop Cases',
    high_risk_visits: 'High-Risk Visits Logged',
    tier_public_facilities: 'Across Tier 2–4 Public Facilities',
    referral_breakdown: 'Referral Lifecycle Breakdown',
    weekly_trends: 'Weekly Care-Coordination Volume Trends',
    quality_assurance: 'Quality-Over-Volume Governance Verification',

    // Kiosk Copy
    kiosk_title: 'CareLink AI — Village Kiosk',
    kiosk_subtitle: 'Public Health Portal · Gram Panchayat Kiosk Mode',
    kiosk_welcome: 'Touch Screen to Begin',
    kiosk_instructions: 'Self-service health check & referral token generator. Your session automatically clears for privacy when done.',
    kiosk_privacy_title: 'This Will Be Discussed Privately',
    kiosk_privacy_desc: 'Diagnostic details for sensitive health symptoms are never displayed on public kiosk screens to protect patient confidentiality. Confidential IVR Voice Callback queued to your phone.',

    // Patient Portal Copy
    opd_portal_title: 'OPD Patient Portal',
    active_appointment: 'Active Appointment & OPD Queue Status',
    queue_wait_time: 'Estimated Queue Wait Time: ~15 mins',
    followup_reminders: 'Follow-Up & Vaccination Reminders',
    personal_timeline: 'My Personal Health Record Timeline',

    // Disclaimers & Empty States
    decision_support_disclaimer: 'This is decision support for the health worker, not a diagnosis. Health worker verification required before action.',
    data_disclaimer: 'CareLink AI · SIH 2026 Problem Statement SIH26133 · Government of Maharashtra State Innovation Society',
    empty_patients: 'No patients found — tap "+ New Visit" to register a patient.',
    empty_referrals: 'No incoming referrals pending for review.',
    patient_not_found: 'Patient record not found',

    // Filter Chips
    filter_all: 'All',
    filter_high_risk: 'High Risk',
    filter_anc: 'ANC',
    filter_chronic: 'Chronic',
    filter_children: 'Children',
  },
  mr: {
    // General App & Navigation
    app_name: 'केरलिंक AI',
    app_subtitle: 'डिजिटल काळजी-समन्वय स्तर',
    connected: 'संबंधित',
    offline: 'ऑफलाइन',
    logout: 'बाहेर पडा',
    launch_portal: 'पोर्टल सुरू करा',
    active_user: 'सक्रिय वापरकर्ता',
    exit_portal: 'पोर्टल बंद करा',

    // Suites & Roles
    asha_suite: 'आशा / एएनएम सूट',
    asha_badge: 'फिल्ड ॲप',
    doctor_suite: 'डॉक्टर सूट',
    doctor_badge: 'आरोग्य केंद्र काळजी',
    executive_suite: 'कार्यकारी डॅशबोर्ड',
    executive_badge: 'गुणवत्ता आणि प्रशासन',
    kiosk_suite: 'ग्रामपंचायत किऑस्क',
    kiosk_badge: 'सार्वजनिक स्व-तपासणी',
    patient_suite: 'रुग्ण ओपीडी पोर्टल',
    patient_badge: 'वैयक्तिक काळजी',

    // Sidebar & Navigation Links
    my_patients: 'माझे रुग्ण',
    referral_tracker: 'संदर्भ मागोवा',
    incoming_referrals: 'येणारे संदर्भ',
    quality_dashboard: 'गुणवत्ता डॅशबोर्ड',

    // Buttons & Actions
    start_new_visit: 'नवीन भेट आणि डिजिटल चाचणी सुरू करा',
    initiate_visit: 'भेट सुरू करा',
    back_to_queue: 'डॉक्टर रांगेकडे परत जा',
    back_to_patients: 'रुग्ण यादीकडे परत जा',
    start_triage_assessment: 'ट्रियाज मूल्यांकन सुरू करा',
    accept_referral: 'संदर्भ स्वीकारा आणि वेळ निश्चित करा',
    complete_consultation: 'सल्लामसलत पूर्ण करा आणि फीडबॅक सबमिट करा',
    re_route_referral: 'चुकीचे तज्ज्ञ → पुनर्निर्देशित करा',
    end_session: 'सत्र संपवा',
    start_session: 'खाजगी आरोग्य तपासणी सुरू करा',
    submit_assessment: 'स्व-तपासणी सबमिट करा',
    cancel_assessment: 'मूल्यांकन रद्द करा',

    // Labels & Placeholders
    search_patient_placeholder: 'नाव किंवा गावावरून रुग्ण शोधा...',
    token_input_label: 'टोकन / रेशन कार्ड आयडी प्रविष्ट करा (पर्यायी)',
    consultation_outcome_label: 'सल्लामसलत निकाल / निदान',
    feedback_label: 'संदर्भित आशा/एएनएम कडे नोंदवलेला अभिप्राय',
    icd10_label: 'ICD-10 / SNOMED निदान कोड',
    symptom_intake_title: 'लक्षणे आणि आवाज इनपुट',
    vitals_title: 'रुग्णाचे व्हिटल्स नोंदवा',
    longitudinal_patient_journey: 'सुविधांमधील रुग्णाचा दीर्घकालीन आरोग्य प्रवास रेकॉर्ड',
    overdue_followup_count: 'अतिदेय पाठपुरावा',

    // Status Badges & Risk Levels
    risk_normal: 'सामान्य धोका',
    risk_moderate: 'मध्यम धोका',
    risk_high: 'उच्च धोका',
    risk_critical: 'गंभीर धोका',
    status_created: 'तयार केले',
    status_notified: 'सूचित केले',
    status_confirmed: 'निश्चित केले',
    status_in_consultation: 'सल्लामसलत सुरू',
    status_completed: 'पूर्ण झाले',
    status_closed: 'बंद केले',
    status_re_referred: 'पुनर्निर्देशित',

    // Urgency Tiers
    urgency_routine: 'नियमित काळजी',
    urgency_urgent: 'तातडीची काळजी',
    urgency_emergency_review: 'आणीबाणी पुनरावलोकन आवश्यक',

    // Dashboard Metrics
    referral_completion_rate: 'संदर्भ पूर्णता दर',
    followup_adherence: 'पाठपुरावा पालन',
    tracked_high_risk: 'ट्रॅक केलेले उच्च-धोका रुग्ण',
    doctors_available: 'कर्तव्यावर उपलब्ध डॉक्टर',
    closed_loop_cases: 'पूर्ण झालेले प्रकरण',
    high_risk_visits: 'नोंदवलेल्या उच्च-धोका भेटी',
    tier_public_facilities: 'स्तर २-४ सार्वजनिक आरोग्य केंद्रांमध्ये',
    referral_breakdown: 'संदर्भ जीवनचक्र विश्लेषण',
    weekly_trends: 'साप्ताहिक काळजी-समन्वय ट्रेंड',
    quality_assurance: 'गुणवत्ता-आधारित प्रशासन पडताळणी',

    // Kiosk Copy
    kiosk_title: 'केरलिंक AI — ग्रामपंचायत किऑस्क',
    kiosk_subtitle: 'सार्वजनिक आरोग्य पोर्टल · ग्रामपंचायत किऑस्क मोड',
    kiosk_welcome: 'सुरू करण्यासाठी स्क्रीनला स्पर्श करा',
    kiosk_instructions: 'स्व-सेवा आरोग्य तपासणी आणि संदर्भ टोकन जनरेटर. पूर्ण झाल्यावर तुमचे सत्र गोपनीयतेसाठी आपोआप साफ होते.',
    kiosk_privacy_title: 'यावर खाजगीरित्या चर्चा केली जाईल',
    kiosk_privacy_desc: 'रुग्णाची गोपनीयता जपण्यासाठी संवेदनशील आरोग्य लक्षणांचे निदान सार्वजनिक किऑस्क स्क्रीनवर कधीही प्रदर्शित केले जात नाही. तुमच्या फोनवर गोपनीय IVR कॉल पाठवला गेला आहे.',

    // Patient Portal Copy
    opd_portal_title: 'रुग्ण ओपीडी पोर्टल',
    active_appointment: 'सक्रिय अपॉइंटमेंट आणि ओपीडी रांग स्थिती',
    queue_wait_time: 'अंदाजे रांगेतील प्रतीक्षा वेळ: ~१५ मिनिटे',
    followup_reminders: 'पाठपुरावा आणि लसीकरण स्मरणपत्रे',
    personal_timeline: 'माझा वैयक्तिक आरोग्य नोंद टाइमलाइन',

    // Disclaimers & Empty States
    decision_support_disclaimer: 'हे आरोग्य कर्मचाऱ्यांसाठी निर्णय समर्थन आहे, निदान नाही. कृती करण्यापूर्वी आरोग्य कर्मचाऱ्याची पडताळणी आवश्यक आहे.',
    data_disclaimer: 'केरलिंक AI · एसआयएच २०२६ समस्या विधान SIH26133 · महाराष्ट्र शासन',
    empty_patients: 'कोणतेही रुग्ण आढळले नाहीत — नवीन नोंदणीसाठी "+ नवीन भेट" वर टॅप करा.',
    empty_referrals: 'पुनरावलोकनासाठी कोणतेही येणारे संदर्भ नाहीत.',
    patient_not_found: 'रुग्ण रेकॉर्ड आढळले नाही',

    // Filter Chips
    filter_all: 'सर्व',
    filter_high_risk: 'उच्च धोका',
    filter_anc: 'गर्भवती (ANC)',
    filter_chronic: 'दीर्घकालीन आजार',
    filter_children: 'लहान मुले',
  }
};
