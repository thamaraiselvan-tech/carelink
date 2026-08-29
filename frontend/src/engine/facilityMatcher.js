export function filterAndRankFacilities(facilities = [], triageResult = {}) {
  const { required_specialty, required_diagnostics = [], care_level } = triageResult;

  const tierMap = {
    sub_centre: 1,
    phc: 2,
    rural_hospital: 3,
    district_hospital: 4
  };

  const minTier = tierMap[care_level] || 1;

  const processed = facilities.map(f => {
    const hasSpecialty = !required_specialty || (f.specialists && f.specialists.includes(required_specialty));
    const hasDiagnostics = required_diagnostics.every(d => f.diagnostics_working && f.diagnostics_working.includes(d));
    const hasDoctor = (f.doctors_available || f.available_doctors || 0) > 0 || f.tier < 2; // Sub-centre handled by ASHA/ANM
    const meetsTier = f.tier >= minTier;

    const isMatched = meetsTier && hasSpecialty && hasDiagnostics && hasDoctor;

    const reasons = [];
    const unmetReasons = [];

    if (meetsTier) reasons.push(`Meets required care tier (${f.type.replace('_', ' ').toUpperCase()})`);
    else unmetReasons.push(`Below required level (${care_level.replace('_', ' ')})`);

    if (required_specialty) {
      if (hasSpecialty) reasons.push(`✅ ${required_specialty} available on duty`);
      else unmetReasons.push(`❌ No ${required_specialty}`);
    }

    if (required_diagnostics.length > 0) {
      if (hasDiagnostics) reasons.push(`✅ ${required_diagnostics.join(', ')} operational today`);
      else {
        const missing = required_diagnostics.filter(d => !(f.diagnostics_working && f.diagnostics_working.includes(d)));
        unmetReasons.push(`❌ ${missing.join(', ')} currently offline/unavailable`);
      }
    }

    if (hasDoctor) {
      const docCount = f.doctors_available || f.available_doctors || 1;
      reasons.push(`✅ ${docCount} doctor(s) on-site`);
    } else {
      unmetReasons.push(`❌ No doctors currently available on-site`);
    }

    reasons.push(`Medicine Stock: ${f.medicines_in_stock || 80}%`);
    reasons.push(`Current Queue: ${f.queue_length || 0} patients`);

    return {
      ...f,
      isMatched,
      reasons,
      unmetReasons
    };
  });

  const matched = processed.filter(f => f.isMatched).sort((a, b) => {
    // Sort: shorter queue first, higher stock
    if (a.queue_length !== b.queue_length) return a.queue_length - b.queue_length;
    return b.medicines_in_stock - a.medicines_in_stock;
  });

  const unmatched = processed.filter(f => !f.isMatched);

  return {
    recommended: matched[0] || null,
    alternatives: matched.slice(1, 3),
    unmatched: unmatched.slice(0, 3)
  };
}
