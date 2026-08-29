export const redFlagRules = [
  {
    id: 'anc_preeclampsia_risk',
    label: 'Pre-eclampsia warning signs (ANC)',
    label_mr: 'प्री-एक्लेम्पसिया चेतावणी चिन्हे (गर्भवती)',
    conditions: {
      isANC: true,
      minSystolicBP: 140,
      symptomsAny: ['headache', 'swelling', 'vision_changes', 'abdominal_pain']
    },
    urgency: 'emergency_review',
    title: 'EMERGENCY REVIEW REQUIRED',
    title_mr: 'तातडीचे वैद्यकीय पुनरावलोकन आवश्यक',
    rationale: 'Elevated Systolic BP (≥ 140 mmHg) with neurological or vascular symptoms in 3rd trimester ANC suggests severe pre-eclampsia risk.',
    rationale_mr: '३ऱ्या तिमाहीतील गर्भवतीमध्ये मज्जासंस्थेची किंवा रक्तवाहिन्यांची लक्षणे आणि उच्च रक्तदाब प्री-एक्लेम्पसियाचा धोका दर्शवतो.',
    required_specialty: 'OB-GYN',
    required_diagnostics: ['Ultrasound', 'Blood Test'],
    care_level: 'district_hospital'
  },
  {
    id: 'child_severe_illness',
    label: 'Severe acute illness in young child',
    label_mr: 'लहान मुलांमध्ये तीव्र आजार',
    conditions: {
      maxAge: 5,
      minTemp: 102.5,
      symptomsAny: ['lethargy', 'not_feeding', 'breathlessness']
    },
    urgency: 'emergency_review',
    title: 'EMERGENCY PEDIATRIC REVIEW',
    title_mr: 'बालरोग आणीबाणी पुनरावलोकन',
    rationale: 'High fever (> 102.5°F) paired with poor feeding or lethargy in under-5 child indicates potential severe infection/sepsis risk.',
    rationale_mr: '५ वर्षांखालील बालकात उच्च ताप आणि सुस्तपणा गंभीर संसर्गाचा धोका दर्शवतो.',
    required_specialty: 'Pediatrics',
    required_diagnostics: ['Blood Test'],
    care_level: 'district_hospital'
  },
  {
    id: 'diabetic_neuropathy',
    label: 'Diabetic Peripheral Neuropathy / Vascular Risk',
    label_mr: 'मधुमेह चेतासंस्थेची गुंतागुंत',
    conditions: {
      hasDiabetes: true,
      symptomsAny: ['numbness_feet'],
    },
    urgency: 'urgent',
    title: 'URGENT SPECIALIST EVALUATION',
    title_mr: 'तातडीचे तज्ज्ञ मूल्यमापन',
    rationale: 'Loss of sensation in feet in diabetic patient indicates peripheral neuropathy; high risk for unobserved ulcers.',
    rationale_mr: 'मधुमेही रुग्णाच्या पायात सुन्नपणा चेतासंस्थेची गुंतागुंत दर्शवतो; जखमांचा धोका असतो.',
    required_specialty: 'General Medicine',
    required_diagnostics: ['Blood Test'],
    care_level: 'rural_hospital'
  },
  {
    id: 'tb_screening_flag',
    label: 'Persistent Respiratory Symptoms (TB Screening)',
    label_mr: 'दीर्घकालीन श्वसन लक्षणे (क्षयरोग तपासणी)',
    conditions: {
      symptomsAny: ['persistent_cough_gt_3weeks', 'weight_loss']
    },
    urgency: 'urgent',
    title: 'RESPIRATORY SCREENING & DIAGNOSTIC',
    title_mr: 'श्वसन तपासणी आणि चाचणी',
    rationale: 'Cough exceeding 3 weeks with weight loss meets ICMR/NTEP protocol criteria for mandatory TB diagnostic screening & spirometry.',
    rationale_mr: '३ आठवड्यांपेक्षा जास्त खोकला आणि वजन कमी होणे हे क्षयरोग चाचणी निकष पूर्ण करते.',
    required_specialty: 'General Medicine',
    required_diagnostics: ['Spirometry', 'Blood Test'],
    care_level: 'phc'
  },
  {
    id: 'routine_anc_check',
    label: 'Routine ANC Follow-up',
    label_mr: 'नियमित गरोदरपण तपासणी',
    conditions: {
      isANC: true,
      maxSystolicBP: 135,
      symptomsNone: ['chest_pain', 'vision_changes', 'swelling', 'headache']
    },
    urgency: 'routine',
    title: 'ROUTINE CARE AT PHC',
    title_mr: 'प्राथमिक आरोग्य केंद्रात नियमित तपासणी',
    rationale: 'Normal vitals and absent red flags. Patient requires standard ANC checkup at local PHC or Sub-Centre.',
    rationale_mr: 'सामान्य रक्तदाब आणि इतर लक्षणे नाहीत. नियमित तपासणी पुरेशी आहे.',
    required_specialty: null,
    required_diagnostics: ['BP Monitor'],
    care_level: 'phc'
  }
];
