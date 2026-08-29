import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { getReferrals } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import Loader from '../../components/ui/Loader';

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
      { key: 'created', label: lang === 'mr' ? 'जारी केले' : 'Issued' },
      { key: 'confirmed', label: lang === 'mr' ? 'स्वीकारले' : 'Accepted' },
      { key: 'in_consultation', label: lang === 'mr' ? 'सल्लामसलत' : 'Consultation' },
      { key: 'completed', label: t('status_completed') },
    ];

    const getStepState = (stepKey) => {
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
          const state = getStepState(s.key);
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
    return <Loader text="CareLink AI Referral Tracker Engine..." />;
  }

  return (
    <div>
      <div className="page-header-box flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('referral_tracker')}</h1>
          <p className="page-subtitle">
            {t('referral_tracker_subtitle')}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadReferrals}>
          <RefreshCw size={14} /> {t('refresh_status')}
        </button>
      </div>

      <div className="flex flex-col gap-lg">
        {referrals.map(ref => (
          <div key={ref.id} className="glass-card">
            <div className="flex justify-between items-start mb-md" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                  <span className="font-bold text-base">{ref.patient_name}</span>
                  <span className={`badge risk-${ref.patient_risk_level || 'normal'}`}>
                    {t(`risk_${ref.patient_risk_level}`) || `${ref.patient_risk_level} risk`}
                  </span>
                  <span className={`badge ref-${ref.status}`}>
                    {t(`status_${ref.status}`) || ref.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-tertiary mt-xs">
                  {ref.from_facility_name} ➔ <strong className="text-teal">{ref.to_facility_name}</strong> · {t('complaint_category')} {ref.complaint_category}
                </div>
              </div>

              <div className="text-xs text-tertiary font-bold">
                {lang === 'mr' ? 'जारी:' : 'Issued:'} {new Date(ref.created_at).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', marginBottom: '16px' }}>
              <strong>{t('structured_reason')}</strong> {ref.reason}
            </div>

            {renderProgressSteps(ref.status)}

            {ref.feedback_to_referrer && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-glass)', fontSize: 'var(--font-xs)' }}>
                <div className="font-bold text-success flex items-center gap-xs">
                  <CheckCircle2 size={16} /> {t('doctor_feedback_received')}
                </div>
                <div className="text-secondary mt-xs" style={{ fontStyle: 'italic', background: '#ECFDF5', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  "{ref.feedback_to_referrer}"
                </div>
              </div>
            )}
          </div>
        ))}

        {referrals.length === 0 && (
          <div className="empty-state">
            <ArrowRightLeft size={48} />
            <p>{t('no_active_referrals')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
