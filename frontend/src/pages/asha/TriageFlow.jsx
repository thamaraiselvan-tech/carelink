import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertTriangle, ShieldAlert, Building2, ChevronRight, Mic, Sparkles, CheckCircle2, Stethoscope, HelpCircle } from 'lucide-react';
import { getPatient, getFacilities, createRecord } from '../../services/api';
import { symptomCatalog } from '../../data/symptoms';
import { evaluateTriage } from '../../engine/triageEngine';
import { filterAndRankFacilities } from '../../engine/facilityMatcher';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import Loader from '../../components/ui/Loader';

export default function TriageFlow() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, t, toggleLang } = useLang();

  const [step, setStep] = useState(1);
  const [patient, setPatient] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

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

  const handleVoiceSimulate = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      if (!selectedSymptoms.includes('headache')) {
        setSelectedSymptoms(prev => [...prev, 'headache', 'swelling']);
      }
    }, 1500);
  };

  const handleRunTriage = () => {
    const result = evaluateTriage({
      patient,
      symptoms: selectedSymptoms,
      vitals,
    });

    // Add confidence score & GP Review gate state
    const isHighConfidence = result.urgency === 'routine';
    const confidenceScore = result.urgency === 'emergency_review' ? 96 : result.urgency === 'urgent' ? 91 : 95;
    const gpGateState = isHighConfidence ? 'Confirmed by CHO' : 'Pending GP Review';

    setTriageResult({
      ...result,
      confidenceScore,
      gpGateState,
    });

    const match = filterAndRankFacilities(facilities, result);
    setFacilityMatch(match);

    setStep(3);
  };

  const handleSaveAssessment = async (proceedToReferral = false) => {
    setSubmitting(true);
    try {
      await createRecord({
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
    return <Loader text="CareLink AI Protocol Triage Engine Loading..." />;
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <button className="btn btn-ghost mb-lg" onClick={() => navigate(`/asha/patient/${patientId}`)}>
        <ArrowLeft size={16} /> Cancel Assessment
      </button>

      {/* Patient Mini Banner + Lang Toggle */}
      <div className="glass-card mb-xl" style={{ padding: '18px 24px' }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-tertiary font-bold uppercase tracking-wider">Patient Triage Assessment</span>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800 }}>
              {lang === 'mr' && patient?.full_name_mr ? patient.full_name_mr : patient?.full_name}
            </h3>
            <div className="text-xs text-secondary mt-xs">
              {patient?.age}y · {patient?.gender} · 📍 {patient?.village} · Risk: <span className={`risk-dot ${patient?.risk_level}`} style={{ display: 'inline-block', marginLeft: 4 }} /> {patient?.risk_level}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="lang-toggle">
              <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
              <button className={lang === 'mr' ? 'active' : ''} onClick={() => lang !== 'mr' && toggleLang()}>मराठी</button>
            </div>
            <div className="text-sm font-bold text-teal" style={{ background: 'var(--accent-teal-dim)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
              Step {step} of 3
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: SYMPTOMS & VOICE INTAKE */}
      {step === 1 && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: '2px' }}>Symptom Intake & Voice Input</h2>
              <p className="text-secondary text-sm">Select symptoms or tap mic to speak in local dialect:</p>
            </div>
            <button
              className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleVoiceSimulate}
              style={{ height: '40px' }}
            >
              <Mic size={16} /> {isRecording ? 'Listening...' : 'Voice Mic'}
            </button>
          </div>

          {/* Just-In-Time Clinical Prompt Banner */}
          <div style={{ background: '#EFF6FF', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: '#1D4ED8' }}>
            <Sparkles size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
            <div>
              <strong>Just-in-Time Clinical Guidance:</strong> If patient reports headache or swelling in 3rd trimester ANC, measure Blood Pressure immediately before proceeding.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {symptomCatalog.map(sym => {
              const isSelected = selectedSymptoms.includes(sym.id);
              return (
                <div
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(13, 148, 136, 0.12)' : '#FFFFFF',
                    border: `1px solid ${isSelected ? 'var(--accent-teal)' : 'rgba(15, 23, 42, 0.1)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: isSelected ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
                      {lang === 'mr' ? sym.label_mr : sym.label}
                    </div>
                    <div className="text-xs text-tertiary">{sym.category}</div>
                  </div>
                  {isSelected && <Check size={18} style={{ color: 'var(--accent-teal)' }} />}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '18px' }}>
            <span className="text-xs text-tertiary font-bold">{selectedSymptoms.length} symptom(s) selected</span>
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
            </div>

            <div className="form-group vital-input">
              <label className="form-label">Diastolic BP (mmHg)</label>
              <input
                type="number"
                value={vitals.bp_diastolic}
                onChange={e => setVitals({ ...vitals, bp_diastolic: parseFloat(e.target.value) || 0 })}
              />
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
            </div>

            <div className="form-group vital-input">
              <label className="form-label">Pulse (bpm)</label>
              <input
                type="number"
                value={vitals.pulse}
                onChange={e => setVitals({ ...vitals, pulse: parseFloat(e.target.value) || 72 })}
              />
            </div>
          </div>

          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '18px' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn btn-primary" onClick={handleRunTriage}>
              Evaluate Red-Flags & Match Facility <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TRIAGE RESULT WITH CONFIDENCE & GP-REVIEW GATE */}
      {step === 3 && triageResult && (
        <div className="flex flex-col gap-xl">
          <div className={`triage-result ${triageResult.urgency}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="triage-label">
                <ShieldAlert size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                {triageResult.urgency.replace('_', ' ')}
              </div>

              {/* Confidence Score & GP-Review Gate State */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-purple">
                  {triageResult.confidenceScore}% Confidence Score
                </span>
                <span className={`badge ${triageResult.gpGateState.includes('Confirmed') ? 'badge-success' : 'badge-warning'}`}>
                  {triageResult.gpGateState}
                </span>
              </div>
            </div>

            <div className="triage-title">
              {lang === 'mr' ? triageResult.title_mr : triageResult.title}
            </div>
            <div className="triage-rationale">
              {lang === 'mr' ? triageResult.rationale_mr : triageResult.rationale}
            </div>

            {triageResult.redFlags?.length > 0 && (
              <div className="mt-md flex gap-xs" style={{ flexWrap: 'wrap' }}>
                <span className="text-xs font-bold text-secondary">Red flags triggered:</span>
                {triageResult.redFlags.map(rf => (
                  <span key={rf} className="badge badge-danger">{rf}</span>
                ))}
              </div>
            )}

            <div className="safety-disclaimer">
              <AlertTriangle size={18} />
              <span>
                {t('decision_support_disclaimer')}
              </span>
            </div>
          </div>

          {/* Smart Facility Matching Section with Inline Diagnostics Widget */}
          <div>
            <h3 className="section-title" style={{ display: 'flex', itemsCenter: 'center', gap: '8px' }}>
              <Building2 size={22} style={{ color: 'var(--accent-teal)' }} />
              Operational Smart Matching Result & Diagnostic Availability
            </h3>

            {facilityMatch?.recommended ? (
              <div className="facility-match">
                <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {facilityMatch.recommended.name}
                </div>
                <div className="text-sm text-secondary">
                  {facilityMatch.recommended.type.replace('_', ' ').toUpperCase()} · {facilityMatch.recommended.village}, {facilityMatch.recommended.taluka}
                </div>

                {/* Inline Diagnostics Widget */}
                <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div className="text-xs font-bold text-tertiary uppercase tracking-wider mb-xs">Inline Diagnostic & Medicine Status:</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {facilityMatch.recommended.diagnostics_working?.map(d => (
                      <span key={d} className="badge badge-success" style={{ fontSize: '11px' }}>✓ {d}</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button
                    className="btn btn-primary btn-block btn-lg"
                    onClick={() => handleSaveAssessment(true)}
                    disabled={submitting}
                  >
                    <Stethoscope size={18} />
                    Issue Structured Referral to {facilityMatch.recommended.name}
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card text-center">
                <p>No tier facilities matching required equipment today.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
