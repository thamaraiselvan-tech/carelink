export const sensitiveCategories = [
  'reproductive_health',
  'mental_health',
  'substance_use',
  'std_screening',
  'domestic_concern'
];

export function isSensitiveSymptom(symptomId) {
  const sensitiveList = [
    'abdominal_pain_pregnancy',
    'mental_distress',
    'reproductive_bleed',
    'substance_dependency'
  ];
  return sensitiveList.includes(symptomId);
}
