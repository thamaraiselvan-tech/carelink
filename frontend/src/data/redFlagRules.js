export const redFlagRules = [
  {
    id: 'anc_preeclampsia_risk',
    label: 'High-Risk Maternal Screening (ANC)',
    label_mr: 'उच्च-धोकादायक माता तपासणी (गर्भवती)',
    conditions: {
      isANC: true,
      minSystolicBP: 140,
      symptomsAny: ['headache', 'swelling', 'vision_changes', 'abdominal_pain']
    },
    urgency: 'emergency_review',
    title: 'URGENT MATERNAL CLINICAL EVALUATION',
    title_mr: 'अति-तातडीचे माता आरोग्य मूल्यमापन आवश्यक',
    rationale: 'Elevated Systolic BP (≥ 140 mmHg) with neurological or vascular symptoms in 3rd trimester ANC requires urgent maternal specialist review.',
    rationale_mr: '३ऱ्या तिमाहीतील गर्भवतीमध्ये मज्जासंस्थेची किंवा रक्तवाहिन्यांची लक्षणे आणि उच्च रक्तदाब तातडीच्या वैद्यकीय मूल्यांकनाची गरज दर्शवतो.',
    source: 'NHM Guidelines for High Risk Pregnancy (Maternal Safety Protocol)',
    required_specialty: 'OB-GYN',
    required_diagnostics: ['Ultrasound', 'Blood Test', 'BP Monitor'],
    care_level: 'district_hospital'
  },
  {
    id: 'child_severe_illness',
    label: 'Severe Acute Illness Screening in Young Child',
    label_mr: 'लहान मुलांमध्ये तीव्र आजार तपासणी',
    conditions: {
      maxAge: 5,
      minTemp: 102.5,
      symptomsAny: ['lethargy', 'not_feeding', 'breathlessness']
    },
    urgency: 'emergency_review',
    title: 'URGENT PEDIATRIC CLINICAL EVALUATION',
    title_mr: 'बालरोग आणीबाणी मूल्यमापन आवश्यक',
    rationale: 'High fever (> 102.5°F) paired with poor feeding or lethargy in under-5 child requires urgent pediatric evaluation.',
    rationale_mr: '५ वर्षांखालील बालकात उच्च ताप आणि सुस्तपणा तातडीच्या बालरोग मूल्यांकनाची गरज दर्शवतो.',
    source: 'IMNCI India / NHM Child Health Screening Protocol',
    required_specialty: 'Pediatrics',
    required_diagnostics: ['Blood Test'],
    care_level: 'district_hospital'
  },
  {
    id: 'diabetic_neuropathy',
    label: 'Diabetic Peripheral Sensation Screening',
    label_mr: 'मधुमेह चेतासंस्थेची गुंतागुंत तपासणी',
    conditions: {
      hasDiabetes: true,
      symptomsAny: ['numbness_feet'],
    },
    urgency: 'urgent',
    title: 'URGENT SPECIALIST CLINICAL REVIEW',
    title_mr: 'तातडीचे तज्ज्ञ मूल्यमापन आवश्यक',
    rationale: 'Loss of sensation in feet in diabetic patient indicates peripheral neuropathy risk; urgent clinical review recommended.',
    rationale_mr: 'मधुमेही रुग्णाच्या पायात सुन्नपणा चेतासंस्थेची गुंतागुंत दर्शवतो; वैद्यकीय मूल्यमापन आवश्यक.',
    source: 'NPCDCS / ICMR Diabetes Management Guidelines',
    required_specialty: 'General Medicine',
    required_diagnostics: ['Blood Test'],
    care_level: 'rural_hospital'
  },
  {
    id: 'tb_screening_flag',
    label: 'Persistent Respiratory Screening (NTEP)',
    label_mr: 'दीर्घकालीन श्वसन लक्षणे (क्षयरोग तपासणी)',
    conditions: {
      symptomsAny: ['persistent_cough_gt_3weeks', 'weight_loss']
    },
    urgency: 'urgent',
    title: 'RESPIRATORY DIAGNOSTIC EVALUATION',
    title_mr: 'श्वसन तपासणी आणि चाचणी मूल्यमापन',
    rationale: 'Cough exceeding 3 weeks with weight loss meets NTEP protocol criteria for mandatory diagnostic screening & spirometry.',
    rationale_mr: '३ आठवड्यांपेक्षा जास्त खोकला आणि वजन कमी होणे हे राष्ट्रीय क्षयरोग निर्मूलन कार्यक्रमाचे तपासणी निकष पूर्ण करते.',
    source: 'NTEP / Central TB Division Technical Guidelines',
    required_specialty: 'General Medicine',
    required_diagnostics: ['Spirometry', 'Blood Test'],
    care_level: 'phc'
  },
  {
    id: 'routine_anc_check',
    label: 'Routine ANC Follow-up Protocol',
    label_mr: 'नियमित गरोदरपण तपासणी',
    conditions: {
      isANC: true,
      maxSystolicBP: 135,
      symptomsNone: ['chest_pain', 'vision_changes', 'swelling', 'headache']
    },
    urgency: 'routine',
    title: 'ROUTINE PHC CLINICAL EVALUATION',
    title_mr: 'प्राथमिक आरोग्य केंद्रात नियमित मूल्यमापन',
    rationale: 'Normal vitals and absent red flags. Patient requires standard routine ANC checkup at local PHC or Sub-Centre.',
    rationale_mr: 'सामान्य रक्तदाब आणि कोणतीही गंभीर लक्षणे नाहीत. नियमित तपासणी पुरेशी आहे.',
    source: 'NHM Standard ANC Antenatal Care Guidelines',
    required_specialty: null,
    required_diagnostics: ['BP Monitor'],
    care_level: 'phc'
  }
];
