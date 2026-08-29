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
          const symptomsList = ref.symptoms_summary ? ref.symptoms_summary.split(',').map(s => s.trim()) : [];

          return (
            <div
              key={ref.id}
              className="glass-card interactive"
              onClick={() => navigate(`/doctor/referral/${ref.id}`)}
              style={isEmergency ? { borderColor: 'rgba(225, 29, 72, 0.4)', background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)' } : {}}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="patient-avatar">
                    {ref.patient_name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>{ref.patient_name}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>({ref.patient_age}y · {ref.patient_gender})</span>
                      <span className={`badge risk-${ref.patient_risk_level}`}>
                        {t(`risk_${ref.patient_risk_level}`) || `${ref.patient_risk_level} risk`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge badge-${isEmergency ? 'danger' : ref.urgency === 'urgent' ? 'warning' : 'info'}`}>
                    {t(`urgency_${ref.urgency}`) || ref.urgency?.replace('_', ' ')}
                  </span>
                  <span className={`badge ref-${ref.status}`}>
                    {t(`status_${ref.status}`) || ref.status?.replace('_', ' ')}
                  </span>
                  <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>

              {/* STRUCTURED KEY-VALUE CLINICAL TABLE (Replaces dense paragraph text) */}
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '14px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84375rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontWeight: 800, width: '38%', textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                        {t('source_facility')}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {ref.from_facility_name}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                        {t('specialty_category')}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--brand-teal)' }}>
                        {ref.complaint_category}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                        {t('clinical_rationale')}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                        {ref.reason}
                      </td>
                    </tr>
                    {symptomsList.length > 0 && (
                      <tr>
                        <td style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                          {t('symptom_tags')}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {symptomsList.map(sym => (
                              <span key={sym} className="badge badge-purple" style={{ height: '24px', fontSize: '0.75rem' }}>
                                {sym}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
