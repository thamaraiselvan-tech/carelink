import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ArrowRight } from 'lucide-react';
import { getReferrals } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import Loader from '../../components/ui/Loader';

export default function DoctorDashboard() {
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
      const res = await getReferrals({ role: 'doctor', facility_id: user?.facility_id });
      setReferrals(res.data || []);
    } catch (err) {
      console.error('Failed to load doctor referrals:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <Loader text="CareLink AI Physician Queue Loading..." />;
  }

  return (
    <div>
      <div className="page-header-box">
        <div>
          <h1 className="page-title">{t('incoming_referrals')}</h1>
          <p className="page-subtitle">
            {user?.facility_name || 'PHC Karjat'} · {user?.full_name || 'Dr. Suresh Kulkarni'} ({user?.specialization || (lang === 'mr' ? 'वैद्यकीय अधिकारी' : 'General Medicine')})
          </p>
        </div>
        <div>
          <span className="badge badge-teal" style={{ height: '32px', padding: '0 16px', fontSize: '0.8125rem' }}>
            {referrals.length} {t('pending_cases')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {referrals.map(ref => {
          const isEmergency = ref.urgency === 'emergency_review';
          return (
            <div
              key={ref.id}
              className="glass-card interactive"
              onClick={() => navigate(`/doctor/referral/${ref.id}`)}
              style={isEmergency ? { borderColor: 'rgba(225, 29, 72, 0.4)', background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)' } : {}}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="patient-avatar">
                    {ref.patient_name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{ref.patient_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>({ref.patient_age}y · {ref.patient_gender})</span>
                      <span className={`badge risk-${ref.patient_risk_level}`}>
                        {t(`risk_${ref.patient_risk_level}`) || `${ref.patient_risk_level} risk`}
                      </span>
                      <span className={`badge badge-${isEmergency ? 'danger' : ref.urgency === 'urgent' ? 'warning' : 'info'}`}>
                        {t(`urgency_${ref.urgency}`) || ref.urgency?.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      {t('referred_from')} <strong style={{ color: 'var(--text-primary)' }}>{ref.from_facility_name}</strong> · {t('complaint_category')} {ref.complaint_category}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ref-${ref.status}`}>
                    {t(`status_${ref.status}`) || ref.status?.replace('_', ' ')}
                  </span>
                  <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>

              {/* Structured Complaint Box */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {t('structured_reason')}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ref.reason}</div>
                {ref.symptoms_summary && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <strong>{t('symptoms')}</strong> {ref.symptoms_summary}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {referrals.length === 0 && (
          <div className="empty-state">
            <Stethoscope size={48} />
            <p>{t('empty_referrals')}</p>
          </div>
        )}
      </div>

      {/* Synthetic Data Disclaimer Banner */}
      <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)' }}>
        {t('data_disclaimer')}
      </div>
    </div>
  );
}
