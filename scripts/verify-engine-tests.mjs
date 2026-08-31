import { validateReferralTransition, isValidReferralTransition, REFERRAL_STATES } from '../frontend/src/engine/referralStateMachine.js';
import { evaluateTriage } from '../frontend/src/engine/triageEngine.js';
import { filterAndRankFacilities } from '../frontend/src/engine/facilityMatcher.js';

console.log('🧪 Running CareLink AI Core Engine Automated Unit Tests...\n');

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// TEST SUITE 1: REFERRAL STATE MACHINE TRANSITION VALIDATION
// -------------------------------------------------------------
console.log('1. Testing Referral State Machine Transition Validation:');

assert(isValidReferralTransition('created', 'confirmed') === true, 'created ➔ confirmed is VALID');
assert(isValidReferralTransition('confirmed', 'completed') === true, 'confirmed ➔ completed is VALID');
assert(isValidReferralTransition('confirmed', 'wrong_destination') === true, 'confirmed ➔ wrong_destination is VALID');
assert(isValidReferralTransition('wrong_destination', 're_routed') === true, 'wrong_destination ➔ re_routed is VALID');
assert(isValidReferralTransition('re_routed', 'completed') === true, 're_routed ➔ completed is VALID');
assert(isValidReferralTransition('closed', 'created') === false, 'closed ➔ created is INVALID (rejection verified)');
assert(isValidReferralTransition('completed', 'created') === false, 'completed ➔ created is INVALID (rejection verified)');

// -------------------------------------------------------------
// TEST SUITE 2: DETERMINISTIC TRIAGE ENGINE & SAFETY BOUNDARY
// -------------------------------------------------------------
console.log('\n2. Testing Deterministic Triage Engine & Safety Boundary:');

const ancPatient = { age: 26, conditions: ['ANC'] };
const ancVitals = { bp_systolic: 152, bp_diastolic: 96, temperature: 98.6 };
const ancSymptoms = ['headache', 'swelling'];

const triageRes = evaluateTriage({ patient: ancPatient, symptoms: ancSymptoms, vitals: ancVitals });

assert(triageRes.urgency === 'emergency_review', 'High BP + headache in ANC triggers emergency_review');
assert(triageRes.title === 'URGENT MATERNAL CLINICAL EVALUATION', 'Safety boundary title is URGENT MATERNAL CLINICAL EVALUATION (no claims of pre-eclampsia diagnosis)');
assert(triageRes.source.includes('NHM Guidelines'), 'Source protocol citation is present');
assert(triageRes.care_level === 'district_hospital', 'Recommended care level is district_hospital');

// -------------------------------------------------------------
// TEST SUITE 3: DETERMINISTIC SMART FACILITY MATCHER
// -------------------------------------------------------------
console.log('\n3. Testing Deterministic Smart Facility Matcher:');

const facilities = [
  { id: 'f1', name: 'Sub-centre Wai', type: 'sub_centre', tier: 1, specialists: [], diagnostics_working: ['BP Monitor'], queue_length: 0 },
  { id: 'f3', name: 'PHC Karjat', type: 'phc', tier: 2, specialists: ['General Medicine'], diagnostics_working: ['BP Monitor'], doctors_available: 2, queue_length: 5 },
  { id: 'f7', name: 'District Hospital Satara', type: 'district_hospital', tier: 4, specialists: ['OB-GYN', 'Pediatrics'], diagnostics_working: ['Ultrasound', 'Blood Test', 'BP Monitor'], doctors_available: 8, queue_length: 18 }
];

const matchRes = filterAndRankFacilities(facilities, triageRes);

assert(matchRes.recommended !== null, 'Recommended facility found');
assert(matchRes.recommended.id === 'f7', 'District Hospital Satara recommended for OB-GYN + Ultrasound requirements');
assert(matchRes.recommended.reasons.length > 0, 'Why Recommended breakdown rationale populated');

console.log(`\n📊 Summary: ${passed}/${total} engine tests passed cleanly!`);
if (passed === total) {
  console.log('✨ All CareLink AI core engine unit tests completed successfully!');
}
