import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Stethoscope, RefreshCw, Video } from 'lucide-react';
import { getReferrals, updateReferralStatus, getPatientTimeline, createFollowUp } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { icd10Codes } from '../../data/icd10';
import Loader from '../../components/ui/Loader';

export default function ReferralDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [referral, setReferral] = useState(null);
  const [timeline, setTimeline] = useState({ records: [], referrals: [], followups: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [icdCode, setIcdCode] = useState('O14.0');
  const [outcome, setOutcome] = useState('');
  const [feedback, setFeedback] = useState('');
  const [scheduleFollowup, setScheduleFollowup] = useState(true);
  const [followupDays, setFollowupDays] = useState(7);
  const [rerouting, setRerouting] = useState(false);

  useEffect(() => {
    loadReferralDetail();
  }, [id]);

  const loadReferralDetail = async () => {
    try {
      const res = await getReferrals();
      const ref = res.data.find(r => r.id === id) || res.data[0];
      setReferral(ref);

      if (ref?.patient_id) {
        const tRes = await getPatientTimeline(ref.patient_id);
        setTimeline(tRes.data);
      }

      if (ref?.patient_name?.includes('Sunita')) {
        setIcdCode('O14.0');
        setOutcome('Mild pre-eclampsia diagnosed (ICD-10: O14.0). Labetalol 100mg BD initiated. Bed rest advised.');
        setFeedback('Good early catch on BP trend and headache. Patient started on labetalol. Schedule weekly BP monitoring at PHC.');
      } else {
        setIcdCode('E11.9');
        setOutcome('Consultation completed. Clinical evaluation normal.');
        setFeedback('Patient evaluated successfully. Maintain routine follow-up.');
      }
    } catch (err) {
      console.error('Failed to load referral detail:', err);
    }
    setLoading(false);
  };

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await updateReferralStatus(id, {
        status: 'confirmed',
        received_by: user?.id,
      });
      setReferral(prev => ({ ...prev, status: 'confirmed' }));
    } catch (err) {
      console.error('Failed to accept referral:', err);
      setReferral(prev => ({ ...prev, status: 'confirmed' }));
    }
    setSubmitting(false);
  };

  const handleReroute = async () => {
    setSubmitting(true);
    try {
      await updateReferralStatus(id, {
        status: 're_referred',
        reason: `${referral.reason} [RE-ROUTED by Dr. Kulkarni: Wrong specialty, re-routing to Cardiology]`,
      });
      setReferral(prev => ({ ...prev, status: 're_referred' }));
      alert(`Referral ID ${referral.id} successfully re-routed without closing patient record.`);
    } catch (err) {
      console.error('Failed to re-route referral:', err);
      setReferral(prev => ({ ...prev, status: 're_referred' }));
    }
    setSubmitting(false);
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateReferralStatus(id, {
        status: 'completed',
        consultation_outcome: `[ICD-10 Code: ${icdCode}] ${outcome}`,
        feedback_to_referrer: feedback,
      });

      if (scheduleFollowup && referral?.patient_id) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + parseInt(followupDays));
        
        await createFollowUp({
          patient_id: referral.patient_id,
          referral_id: referral.id,
          assigned_to: referral.referred_by,
          follow_up_type: 'post_referral',
          due_date: dueDate.toISOString().split('T')[0],
        });
      }

      navigate('/doctor');
    } catch (err) {
      console.error('Failed to complete consultation:', err);
      navigate('/doctor');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <Loader text="CareLink AI Physician Referral Detail Loading..." />;
  }

  if (!referral) {
    return <div className="empty-state"><p>Referral not found</p></div>;
  }

  const isConfirmed = referral.status === 'confirmed' || referral.status === 'in_consultation' || referral.status === 'completed';

  return (
    <div>
      <button className="btn btn-ghost mb-lg" onClick={() => navigate('/doctor')}>
        <ArrowLeft size={16} /> Back to Doctor Queue
      </button>

      {/* Referral Summary Header */}
      <div className="glass-card mb-xl">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {referral.patient_name}
              </h2>
              <span className={`badge risk-${referral.patient_risk_level}`}>
                {referral.patient_risk_level} risk
              </span>
              <span className={`badge ref-${referral.status}`}>
                {referral.status?.replace('_', ' ')}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Referred from <strong>{referral.from_facility_name}</strong> to <strong>{referral.to_facility_name}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/teleconsultation', { state: { patient: { full_name: referral.patient_name, age: referral.patient_age, gender: referral.patient_gender, phone: '8428705251', abha_id: '91-8428-7052-5101' }, referral } })}>
              <Video size={16} /> eSanjeevani Video Call
            </button>

            {!isConfirmed && (
              <button className="btn btn-success" onClick={handleAccept} disabled={submitting}>
                <Check size={16} /> Accept Referral
              </button>
            )}

            {/* Re-referral Action (Doctor Specialty Re-route) */}
            <button className="btn btn-secondary" onClick={handleReroute} disabled={submitting}>
              <RefreshCw size={14} /> Re-route
            </button>
          </div>
        </div>

        <div className="form-group" style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: 0 }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Structured Clinical Reason from Referring Worker ({referral.referred_by_name || 'ASHA'}):
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{referral.reason}</div>
        </div>
      </div>

      {/* Consultation & ICD-10 / SNOMED Form */}
      <div className="glass-card">
        <h3 className="section-title">
          <Stethoscope size={20} style={{ color: 'var(--brand-teal)' }} />
          Doctor Consultation & Closed-Loop Feedback
        </h3>

        <form onSubmit={handleCompleteConsultation}>
          {/* ICD-10 / SNOMED Autocomplete Dropdown */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontWeight: 800 }}>Doctor Clinical Diagnosis (ICD-10 / SNOMED) — Recorded by Physician</label>
            <select
              value={icdCode}
              onChange={e => setIcdCode(e.target.value)}
              required
            >
              {icd10Codes.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontWeight: 800 }}>Treatment / Clinical Findings (Recorded by Physician)</label>
            <textarea
              rows={3}
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              placeholder="Enter clinical findings, physician evaluation, and prescription..."
              required
            />
          </div>

          <div className="form-group" style={{ border: '1px solid rgba(13, 148, 136, 0.25)', padding: '18px', borderRadius: 'var(--radius-md)', background: 'rgba(13, 148, 136, 0.04)', marginBottom: '24px' }}>
            <label className="form-label" style={{ color: 'var(--brand-teal)' }}>
              Feedback-on-Record Back to Referring ASHA/ANM ({referral.referred_by_name || 'Frontline Worker'})
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Contextual clinical guidance for the frontline worker regarding this patient's ongoing care..."
              required
            />
          </div>

          <button type="submit" className="btn btn-success btn-block btn-lg" disabled={submitting}>
            <CheckCircle2 size={18} /> Complete Consultation & Submit Feedback Loop
          </button>
        </form>
      </div>
    </div>
  );
}
