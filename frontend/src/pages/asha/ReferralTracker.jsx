import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, CheckCircle2, Clock, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { getReferrals } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

export default function ReferralTracker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, t } = useLang();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const res = await getReferrals({ role: 'asha' });
      setReferrals(res.data);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    }
    setLoading(false);
  };

  const renderProgressSteps = (status) => {
    const steps = [
      { key: 'created', label: 'Issued' },
      { key: 'confirmed', label: 'Accepted' },
      { key: 'in_consultation', label: 'Consultation' },
      { key: 'completed', label: 'Completed' },
    ];

    const getStepState = (stepKey, idx) => {
      if (status === 'missed') return 'missed';
      if (status === 'closed' || status === 'completed') return 'completed';
      
      const statusOrder = ['created', 'notified', 'confirmed', 'in_consultation', 'completed', 'closed'];
      const currentIdx = statusOrder.indexOf(status);
      const stepIdx = statusOrder.indexOf(stepKey);

      if (currentIdx >= stepIdx) return 'completed';
      if (currentIdx === stepIdx - 1) return 'active';
      return '';
    };

    return (
      <div className="referral-progress">
        {steps.map((s, idx) => {
          const state = getStepState(s.key, idx);
          return (
            <div key={s.key} className={`progress-step ${state}`}>
              <div className="progress-dot">
                {state === 'completed' ? '✓' : idx + 1}
              </div>
              <div className="progress-label">{s.label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center p-xl">Loading referral lifecycle tracker...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="page-title">Referral Tracker</h1>
          <p className="text-secondary text-sm">
            End-to-end referral state machine tracking — closed loop with doctor feedback
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadReferrals}>
          <RefreshCw size={14} /> Refresh Status
        </button>
      </div>

      <div className="flex flex-col gap-lg">
        {referrals.map(ref => (
          <div key={ref.id} className="glass-card">
            <div className="flex justify-between items-start mb-md" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div className="flex items-center gap-sm">
                  <span className="font-bold text-base">{ref.patient_name}</span>
                  <span className={`badge risk-${ref.patient_risk_level || 'normal'}`}>
                    {ref.patient_risk_level || 'normal'}
                  </span>
                  <span className={`badge ref-${ref.status}`}>
                    {ref.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-tertiary mt-xs">
                  {ref.from_facility_name} ➔ <strong className="text-teal">{ref.to_facility_name}</strong> · Category: {ref.complaint_category}
                </div>
              </div>

              <div className="text-xs text-tertiary">
                Issued: {new Date(ref.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>

            {/* Structured Reason */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <strong>Structured Reason:</strong> {ref.reason}
            </div>

            {/* State Machine Progress Bar */}
            {renderProgressSteps(ref.status)}

            {/* Closed-loop feedback from Doctor */}
            {ref.feedback_to_referrer && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-glass)', fontSize: 'var(--font-xs)' }}>
                <div className="font-semibold text-success flex items-center gap-xs">
                  <CheckCircle2 size={14} /> Doctor Feedback-on-Record Received:
                </div>
                <div className="text-secondary mt-xs" style={{ fontStyle: 'italic' }}>
                  "{ref.feedback_to_referrer}"
                </div>
              </div>
            )}
          </div>
        ))}

        {referrals.length === 0 && (
          <div className="empty-state">
            <ArrowRightLeft size={48} />
            <p>No active referrals being tracked</p>
          </div>
        )}
      </div>
    </div>
  );
}
