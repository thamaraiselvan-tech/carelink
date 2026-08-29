import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Stethoscope, AlertTriangle, Building2, Calendar, FileText } from 'lucide-react';
import { getReferrals, updateReferralStatus, getPatientTimeline, createFollowUp } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ReferralDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [referral, setReferral] = useState(null);
  const [timeline, setTimeline] = useState({ records: [], referrals: [], followups: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form for completing consultation
  const [outcome, setOutcome] = useState('');
  const [feedback, setFeedback] = useState('');
  const [scheduleFollowup, setScheduleFollowup] = useState(true);
  const [followupDays, setFollowupDays] = useState(7);

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

      // Pre-fill demo values for doctor consultation demo
      if (ref?.patient_name?.includes('Sunita')) {
        setOutcome('Mild pre-eclampsia diagnosed. Labetalol 100mg BD initiated. Bed rest advised.');
        setFeedback('Good early catch on BP trend and headache. Patient started on labetalol. Schedule weekly BP monitoring at PHC.');
      } else {
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

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateReferralStatus(id, {
        status: 'completed',
        consultation_outcome: outcome,
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
    return <div className="text-center p-xl">Loading referral record...</div>;
  }

  if (!referral) {
    return <div className="empty-state"><p>Referral not found</p></div>;
  }

  const isConfirmed = referral.status === 'confirmed' || referral.status === 'in_consultation' || referral.status === 'completed';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button className="btn btn-ghost mb-lg" onClick={() => navigate('/doctor')}>
        <ArrowLeft size={16} /> Back to Doctor Queue
      </button>

      {/* Referral Summary Header */}
      <div className="glass-card mb-xl">
        <div className="flex justify-between items-start mb-md" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="flex items-center gap-sm">
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>
                {referral.patient_name}
              </h2>
              <span className={`badge risk-${referral.patient_risk_level}`}>
                {referral.patient_risk_level} risk
              </span>
              <span className={`badge ref-${referral.status}`}>
                {referral.status?.replace('_', ' ')}
              </span>
            </div>
            <div className="text-sm text-secondary mt-xs">
              Referred from <strong>{referral.from_facility_name}</strong> to <strong>{referral.to_facility_name}</strong>
            </div>
          </div>

          {!isConfirmed && (
            <button className="btn btn-success" onClick={handleAccept} disabled={submitting}>
              <Check size={16} /> Accept Referral & Confirm Slot
            </button>
          )}
        </div>

        <div className="form-group mt-md" style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
          <div className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-xs">
            Structured Clinical Reason from Referring Worker ({referral.referred_by_name || 'ASHA'}):
          </div>
          <div className="text-sm font-semibold">{referral.reason}</div>
          {referral.prior_history_summary && (
            <div className="text-xs text-secondary mt-sm">
              <strong>Prior History:</strong> {referral.prior_history_summary}
            </div>
          )}
        </div>
      </div>

      {/* Longitudinal Patient Record History (Context for Doctor) */}
      <div className="mb-xl">
        <h3 className="section-title">Longitudinal Patient Record History Across Tiers</h3>
        <div className="flex flex-col gap-sm">
          {timeline.records?.map(rec => (
            <div key={rec.id} className="glass-card" style={{ padding: '12px 16px' }}>
              <div className="flex justify-between text-xs text-tertiary mb-xs">
                <span>{new Date(rec.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {rec.facility_name}</span>
                <span className="badge badge-teal">{rec.record_type}</span>
              </div>
              <div className="text-sm font-semibold">{rec.diagnosis || rec.notes}</div>
              {rec.vitals && (
                <div className="text-xs text-secondary mt-xs">
                  Vitals: {typeof rec.vitals === 'string' ? rec.vitals : JSON.stringify(rec.vitals)}
                </div>
              )}
            </div>
          ))}
          {(!timeline.records || timeline.records.length === 0) && (
            <div className="text-xs text-tertiary">First recorded visit for this patient across facilities.</div>
          )}
        </div>
      </div>

      {/* Consultation & Closed-Loop Feedback Section */}
      <div className="glass-card">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Stethoscope size={20} style={{ color: 'var(--accent-teal)' }} />
          Doctor Consultation & Closed-Loop Feedback
        </h3>

        <form onSubmit={handleCompleteConsultation}>
          <div className="form-group mb-lg">
            <label className="form-label">Consultation Outcome / Diagnosis</label>
            <textarea
              rows={3}
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              placeholder="Enter clinical findings, diagnosis, and prescription..."
              required
            />
          </div>

          <div className="form-group mb-lg" style={{ border: '1px solid var(--accent-teal-dim)', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-teal-dim)' }}>
            <label className="form-label" style={{ color: 'var(--accent-teal)' }}>
              Feedback-on-Record Back to Referring ASHA/ANM ({referral.referred_by_name || 'Frontline Worker'})
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Contextual clinical guidance for the frontline worker regarding this patient's ongoing care..."
              required
            />
            <div className="text-xs text-tertiary mt-xs">
              This feedback populates directly into the ASHA's Referral Tracker and supervisor competency view.
            </div>
          </div>

          <div className="form-group mb-xl">
            <label className="flex items-center gap-sm cursor-pointer" style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={scheduleFollowup}
                onChange={e => setScheduleFollowup(e.target.checked)}
                style={{ width: 'auto' }}
              />
              Automatically schedule follow-up alert for frontline worker
            </label>

            {scheduleFollowup && (
              <div className="flex items-center gap-md mt-sm">
                <span className="text-xs text-secondary">Follow-up due in:</span>
                <select
                  value={followupDays}
                  onChange={e => setFollowupDays(e.target.value)}
                  style={{ width: '180px' }}
                >
                  <option value={7}>7 days (1 week)</option>
                  <option value={14}>14 days (2 weeks)</option>
                  <option value={30}>30 days (1 month)</option>
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-success btn-block btn-lg" disabled={submitting}>
            <CheckCircle2 size={18} /> Complete Consultation & Submit Feedback Loop
          </button>
        </form>
      </div>
    </div>
  );
}
