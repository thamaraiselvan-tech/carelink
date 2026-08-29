import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertTriangle, ShieldAlert, Building2, ChevronRight, Activity, Stethoscope } from 'lucide-react';
import { getPatient, getFacilities, matchFacility, createRecord } from '../../services/api';
import { symptomCatalog } from '../../data/symptoms';
import { evaluateTriage } from '../../engine/triageEngine';
import { filterAndRankFacilities } from '../../engine/facilityMatcher';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

export default function TriageFlow() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, t } = useLang();

  const [step, setStep] = useState(1);
  const [patient, setPatient] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [vitals, setVitals] = useState({
    bp_systolic: 120,
    bp_diastolic: 80,
    temperature: 98.4,
    pulse: 76,
    spo2: 98,
    weight: 55,
  });

  const [triageResult, setTriageResult] = useState(null);
  const [facilityMatch, setFacilityMatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      const [pRes, fRes] = await Promise.all([
        getPatient(patientId),
        getFacilities(),
      ]);
      setPatient(pRes.data);
      setFacilities(fRes.data);

      // Pre-fill vitals/symptoms based on patient condition (Sunita pre-eclampsia demo scenario)
      if (pRes.data.full_name?.includes('Sunita')) {
        setSelectedSymptoms(['headache', 'swelling']);
        setVitals({
          bp_systolic: 152,
          bp_diastolic: 96,
          temperature: 98.6,
          pulse: 84,
          spo2: 98,
          weight: 58,
        });
      }
    } catch (err) {
      console.error('Failed to load triage data:', err);
    }
    setLoading(false);
  };

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleRunTriage = () => {
    const result = evaluateTriage({
      patient,
      symptoms: selectedSymptoms,
      vitals,
    });
    setTriageResult(result);

    // Filter/match facilities
    const match = filterAndRankFacilities(facilities, result);
    setFacilityMatch(match);

    setStep(3);
  };

  const handleSaveAssessment = async (proceedToReferral = false) => {
    setSubmitting(true);
    try {
      const rec = await createRecord({
        patient_id: patient.id,
        facility_id: user?.facility_id || facilities[0]?.id,
        recorded_by: user?.id,
        record_type: 'assessment',
        symptoms: selectedSymptoms,
        vitals: {
          bp: `${vitals.bp_systolic}/${vitals.bp_diastolic}`,
          temp: vitals.temperature,
          pulse: vitals.pulse,
          spo2: vitals.spo2,
          weight: vitals.weight,
        },
        red_flags_detected: triageResult.redFlags,
        assessment_urgency: triageResult.urgency,
        assessment_rationale: triageResult.rationale,
        facility_recommended: facilityMatch?.recommended?.id,
        notes: `Triage evaluation completed: ${triageResult.title}`,
      });

      if (proceedToReferral) {
        navigate(`/asha/referral/create/${patient.id}`, {
          state: {
            triageResult,
            recommendedFacility: facilityMatch?.recommended,
            symptoms: selectedSymptoms,
            vitals,
          }
        });
      } else {
        navigate(`/asha/patient/${patient.id}`);
      }
    } catch (err) {
      console.error('Failed to save assessment:', err);
      // Fallback redirect if backend issue
      if (proceedToReferral) {
        navigate(`/asha/referral/create/${patient.id}`, {
          state: {
            triageResult,
            recommendedFacility: facilityMatch?.recommended,
            symptoms: selectedSymptoms,
            vitals,
          }
        });
      } else {
        navigate(`/asha/patient/${patient.id}`);
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-between" style={{ minHeight: '300px', justifyContent: 'center' }}><Activity size={32} className="text-secondary" style={{ animation: 'pulse-badge 1.5s infinite' }} /></div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="btn btn-ghost mb-lg" onClick={() => navigate(`/asha/patient/${patientId}`)}>
        <ArrowLeft size={16} /> Cancel Assessment
      </button>

      {/* Patient Mini Banner */}
      <div className="glass-card mb-xl" style={{ padding: '16px 24px' }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-tertiary">Patient Assessment for</span>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>
              {lang === 'mr' && patient?.full_name_mr ? patient.full_name_mr : patient?.full_name}
            </h3>
            <div className="text-xs text-secondary mt-xs">
              {patient?.age}y · {patient?.gender} · 📍 {patient?.village} · Risk: <span className={`risk-dot ${patient?.risk_level}`} style={{ display: 'inline-block', marginLeft: 4 }} /> {patient?.risk_level}
            </div>
          </div>
          <div className="text-sm font-semibold text-teal">
            Step {step} of 3
          </div>
        </div>
      </div>

      {/* STEP 1: SYMPTOMS */}
      {step === 1 && (
        <div className="glass-card">
          <h2 className="section-title">Select Reported Symptoms</h2>
          <p className="text-secondary text-sm mb-lg">
            Tap symptoms reported during home visit / encounter:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {symptomCatalog.map(sym => {
              const isSelected = selectedSymptoms.includes(sym.id);
              return (
                <div
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--accent-teal-dim)' : 'var(--bg-tertiary)',
                    border: `1px solid ${isSelected ? 'var(--accent-teal)' : 'var(--border-glass)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: isSelected ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
                      {lang === 'mr' ? sym.label_mr : sym.label}
                    </div>
                    <div className="text-xs text-tertiary">{sym.category}</div>
                  </div>
                  {isSelected && <Check size={16} style={{ color: 'var(--accent-teal)' }} />}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
            <span className="text-xs text-tertiary">{selectedSymptoms.length} symptom(s) selected</span>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Next: Enter Vitals <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VITALS */}
      {step === 2 && (
        <div className="glass-card">
          <h2 className="section-title">Record Patient Vitals</h2>
          <p className="text-secondary text-sm mb-lg">
            Enter key physiological readings measured:
          </p>

          <div className="form-row mb-lg">
            <div className="form-group vital-input">
              <label className="form-label">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={vitals.bp_systolic}
                onChange={e => setVitals({ ...vitals, bp_systolic: parseFloat(e.target.value) || 0 })}
              />
              <span className={`vital-status ${vitals.bp_systolic >= 140 ? 'critical' : vitals.bp_systolic >= 130 ? 'elevated' : 'normal'}`} />
            </div>

            <div className="form-group vital-input">
              <label className="form-label">Diastolic BP (mmHg)</label>
              <input
                type="number"
                value={vitals.bp_diastolic}
                onChange={e => setVitals({ ...vitals, bp_diastolic: parseFloat(e.target.value) || 0 })}
              />
              <span className={`vital-status ${vitals.bp_diastolic >= 90 ? 'critical' : 'normal'}`} />
            </div>
          </div>

          <div className="form-row mb-xl">
            <div className="form-group vital-input">
              <label className="form-label">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={e => setVitals({ ...vitals, temperature: parseFloat(e.target.value) || 98.4 })}
              />
              <span className={`vital-status ${vitals.temperature >= 102 ? 'critical' : vitals.temperature >= 99.5 ? 'elevated' : 'normal'}`} />
            </div>

            <div className="form-group vital-input">
              <label className="form-label">Pulse (bpm)</label>
              <input
                type="number"
                value={vitals.pulse}
                onChange={e => setVitals({ ...vitals, pulse: parseFloat(e.target.value) || 72 })}
              />
              <span className="vital-status normal" />
            </div>
          </div>

          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn btn-primary" onClick={handleRunTriage}>
              Evaluate Red-Flags & Match Facility <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TRIAGE RESULT & SMART FACILITY MATCHING */}
      {step === 3 && triageResult && (
        <div className="flex flex-col gap-xl">
          {/* Triage Assessment Card */}
          <div className={`triage-result ${triageResult.urgency}`}>
            <div className="triage-label">
              <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {triageResult.urgency.replace('_', ' ')}
            </div>
            <div className="triage-title">
              {lang === 'mr' ? triageResult.title_mr : triageResult.title}
            </div>
            <div className="triage-rationale">
              {lang === 'mr' ? triageResult.rationale_mr : triageResult.rationale}
            </div>

            {triageResult.redFlags?.length > 0 && (
              <div className="mt-md flex gap-xs" style={{ flexWrap: 'wrap' }}>
                <span className="text-xs font-semibold text-secondary">Red flags triggered:</span>
                {triageResult.redFlags.map(rf => (
                  <span key={rf} className="badge badge-danger">{rf}</span>
                ))}
              </div>
            )}

            <div className="safety-disclaimer">
              <AlertTriangle size={16} />
              <span>
                {t('decision_support_disclaimer')}
              </span>
            </div>
          </div>

          {/* Smart Facility Matching Section */}
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} style={{ color: 'var(--accent-teal)' }} />
              Operational Smart Matching Result
            </h3>

            {facilityMatch?.recommended ? (
              <div className="facility-match">
                <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {facilityMatch.recommended.name}
                </div>
                <div className="text-sm text-secondary">
                  {facilityMatch.recommended.type.replace('_', ' ').toUpperCase()} · {facilityMatch.recommended.village}, {facilityMatch.recommended.taluka}
                </div>

                <div className="match-reasons">
                  <div className="font-semibold text-xs text-tertiary uppercase tracking-wider mt-sm">Availability Verification Proof:</div>
                  {facilityMatch.recommended.reasons?.map((reason, idx) => (
                    <div key={idx} className="match-reason met">
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => handleSaveAssessment(true)}
                    disabled={submitting}
                  >
                    <Stethoscope size={16} />
                    Issue Structured Referral to {facilityMatch.recommended.name}
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card text-center">
                <p>No tier facilities matching required equipment today.</p>
              </div>
            )}

            {/* Unmatched / Alternative Facilities */}
            {facilityMatch?.unmatched?.length > 0 && (
              <div className="mt-lg">
                <div className="text-xs font-semibold text-tertiary mb-sm uppercase tracking-wider">
                  Facilities Checked & Filtered Out (Wasted Trip Prevented):
                </div>
                <div className="flex flex-col gap-sm">
                  {facilityMatch.unmatched.map(unm => (
                    <div key={unm.id} className="facility-unmatched">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{unm.name} ({unm.type})</span>
                        <span className="text-xs text-danger font-semibold">Unmatched</span>
                      </div>
                      <div className="text-xs text-secondary mt-xs">
                        {unm.unmetReasons?.join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-lg">
            <button className="btn btn-secondary" onClick={() => setStep(2)}>
              Adjust Vitals
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => handleSaveAssessment(false)}
              disabled={submitting}
            >
              Save Record & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
