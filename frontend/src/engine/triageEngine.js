import { redFlagRules } from '../data/redFlagRules';

export function evaluateTriage({ patient, symptoms = [], vitals = {} }) {
  const isANC = patient?.conditions?.includes('ANC') || vitals.isANC;
  const hasDiabetes = patient?.conditions?.includes('Diabetes');
  const age = patient?.age || 30;
  const systolicBP = parseFloat(vitals.bp_systolic || (vitals.bp ? vitals.bp.split('/')[0] : 120));
  const temp = parseFloat(vitals.temperature || 98.4);

  // Check emergency hard stop
  if (symptoms.includes('chest_pain')) {
    return {
      ruleId: 'cardiac_emergency',
      urgency: 'emergency_review',
      title: 'CRITICAL EMERGENCY REVIEW',
      title_mr: 'अति-तातडीचे आणीबाणी पुनरावलोकन',
      rationale: 'Chest pain detected. Requires immediate emergency clinical evaluation at District Hospital facility.',
      rationale_mr: 'छातीत दुखण्याची नोंद झाली आहे. ताबडतोब जिल्हा रुग्णालयात तातडीने तपासणी आवश्यक आहे.',
      required_specialty: 'General Medicine',
      required_diagnostics: ['ECG'],
      care_level: 'district_hospital',
      redFlags: ['chest_pain_detected']
    };
  }

  // Iterate rules
  for (const rule of redFlagRules) {
    const c = rule.conditions;
    let match = true;

    if (c.isANC && !isANC) match = false;
    if (c.hasDiabetes && !hasDiabetes) match = false;
    if (c.maxAge && age > c.maxAge) match = false;
    if (c.minSystolicBP && systolicBP < c.minSystolicBP) match = false;
    if (c.maxSystolicBP && systolicBP > c.maxSystolicBP) match = false;
    if (c.minTemp && temp < c.minTemp) match = false;

    if (c.symptomsAny && !c.symptomsAny.some(s => symptoms.includes(s))) match = false;
    if (c.symptomsNone && c.symptomsNone.some(s => symptoms.includes(s))) match = false;

    if (match) {
      return {
        ...rule,
        redFlags: symptoms.filter(s => c.symptomsAny?.includes(s) || s === 'chest_pain')
      };
    }
  }

  // Default fallback
  return {
    ruleId: 'routine_fallback',
    urgency: 'routine',
    title: 'ROUTINE PHC EVALUATION',
    title_mr: 'नियमित पीएचसी मूल्यांकन',
    rationale: 'No red-flag protocol symptoms triggered. Standard consultation at local Primary Health Centre (PHC) recommended.',
    rationale_mr: 'कोणतीही गंभीर लक्षणे आढळली नाहीत. स्थानिक प्राथमिक आरोग्य केंद्रात तपासणीचा सल्ला दिला जातो.',
    required_specialty: null,
    required_diagnostics: ['Blood Test'],
    care_level: 'phc',
    redFlags: []
  };
}
