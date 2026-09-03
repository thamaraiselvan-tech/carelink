import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, Users, ArrowRight, CalendarX, PlusCircle } from 'lucide-react';
import { getPatients, getOutreachAlerts } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const riskColors = {
  normal: 'risk-normal',
  moderate: 'risk-moderate',
  high: 'risk-high',
  critical: 'risk-critical',
};

const conditionLabels = {
  ANC: { en: 'ANC', mr: 'गरोदर', color: '#8B5CF6' },
  Diabetes: { en: 'Diabetes', mr: 'मधुमेह', color: '#D97706' },
  Hypertension: { en: 'HTN', mr: 'उच्च रक्तदाब', color: '#E11D48' },
  TB: { en: 'TB', mr: 'क्षयरोग', color: '#EA580C' },
  Immunization: { en: 'Immunization', mr: 'लसीकरण', color: '#0284C7' },
  Malnutrition: { en: 'Malnutrition', mr: 'कुपोषण', color: '#DB2777' },
};

export default function AshaDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, highRisk: 0, overdueFollowups: 0, activeReferrals: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, aRes] = await Promise.all([
        getPatients(),
        getOutreachAlerts(),
      ]);
      setPatients(pRes.data || []);
      setAlerts(aRes.data || []);

      setStats({
        total: pRes.data?.length || 5,
        highRisk: pRes.data?.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length || 4,
        overdueFollowups: aRes.data?.length || 4,
        activeReferrals: 9,
      });
    } catch (err) {
      console.error('Failed to load ASHA data:', err);
    }
    setLoading(false);
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = !search ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.village?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'high_risk' && (p.risk_level === 'high' || p.risk_level === 'critical')) ||
      (filter === 'anc' && p.conditions?.includes('ANC')) ||
      (filter === 'chronic' && (p.conditions?.includes('Diabetes') || p.conditions?.includes('Hypertension') || p.conditions?.includes('TB'))) ||
      (filter === 'children' && p.age <= 5);
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ paddingBottom: '88px' }}>
      {/* Mobile-First Header */}
      <div className="page-header-box" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>{t('patients')}</h1>
          <p className="page-subtitle" style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
            {user?.facility_name || 'Sub-centre Wai'} · {user?.full_name || 'Poojha G'} (Field Officer)
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <div className="stat-icon"><Users size={20} /></div>
              <span className="stat-label">Assigned Households</span>
              <span className="stat-value">{stats.total}</span>
              <span className="stat-detail">Active Field Records</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#EA580C' }}><AlertTriangle size={20} /></div>
              <span className="stat-label">High Risk</span>
              <span className="stat-value" style={{ background: 'linear-gradient(135deg, #EA580C, #E11D48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.highRisk}</span>
              <span className="stat-detail">Priority ANC / Chronic</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(225, 29, 72, 0.12)', color: '#E11D48' }}><CalendarX size={20} /></div>
              <span className="stat-label">Missed Care Alerts</span>
              <span className="stat-value" style={{ background: 'linear-gradient(135deg, #E11D48, #DC2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.overdueFollowups}</span>
              <span className="stat-detail">Proactive Action Triggers</span>
            </div>
          </div>

          {/* Outreach Alert Banner */}
          {alerts.length > 0 && (
            <div className="alert-banner emergency" style={{ marginBottom: '20px' }}>
              <div className="alert-icon">
                <AlertTriangle size={22} />
              </div>
              <div className="alert-content">
                <div className="alert-title" style={{ fontSize: '1rem', fontWeight: 800 }}>⚠ {alerts.length} Missed Care Action Alerts</div>
                <div className="alert-subtitle" style={{ fontSize: '0.875rem' }}>
                  {alerts.map((a, i) => (
                    <span key={a.id || i}>
                      {i > 0 && ' · '}
                      <strong>{a.full_name}</strong> ({a.days_overdue}d overdue)
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn btn-danger" style={{ minHeight: '44px' }} onClick={() => {
                if (alerts[0]) navigate(`/asha/patient/${alerts[0].patient_id}`);
              }}>
                {t('initiate_visit')}
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder={t('search_patient_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '48px', minHeight: '48px', fontSize: '1rem' }}
              />
            </div>
            <div className="tab-bar" style={{ marginBottom: 0 }}>
              {[
                { key: 'all', label: t('filter_all') },
                { key: 'high_risk', label: t('filter_high_risk') },
                { key: 'anc', label: t('filter_anc') },
                { key: 'chronic', label: t('filter_chronic') },
              ].map(f => (
                <button key={f.key} className={`tab-item ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)} style={{ minHeight: '40px', fontSize: '0.875rem' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Patient Touch Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredPatients.map(patient => {
              const isOverdue = alerts.some(a => a.patient_id === patient.id);

              return (
                <div
                  key={patient.id}
                  className="patient-card"
                  onClick={() => navigate(`/asha/patient/${patient.id}`)}
                  style={{
                    minHeight: '84px',
                    padding: '18px 20px',
                    borderColor: isOverdue ? 'rgba(225, 29, 72, 0.4)' : 'var(--border-card)',
                    background: isOverdue ? 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)' : '#FFFFFF',
                  }}
                >
                  <div className="patient-avatar" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                    {patient.full_name?.charAt(0)}
                  </div>

                  <div className="patient-info">
                    <div className="patient-name" style={{ fontSize: '1.0625rem', fontWeight: 800 }}>
                      <span className={`risk-dot ${patient.risk_level}`} />
                      {lang === 'mr' && patient.full_name_mr ? patient.full_name_mr : patient.full_name}
                    </div>
                    <div className="patient-meta" style={{ fontSize: '0.84375rem', marginTop: '3px' }}>
                      <span>{patient.age}y · {patient.gender}</span>
                      <span>📍 {patient.village}</span>
                    </div>
                    {patient.conditions?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {patient.conditions.map(c => {
                          const config = conditionLabels[c] || { en: c, color: '#64748B' };
                          return (
                            <span
                              key={c}
                              className="badge"
                              style={{ background: `${config.color}15`, color: config.color, border: `1px solid ${config.color}30`, fontSize: '0.75rem', height: '24px' }}
                            >
                              {lang === 'mr' ? config.mr : config.en}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span className={`badge ${riskColors[patient.risk_level]}`} style={{ height: '26px', fontSize: '0.75rem' }}>
                      {patient.risk_level} risk
                    </span>
                    {isOverdue && (
                      <span className="badge badge-danger">
                        ⚠ OVERDUE
                      </span>
                    )}
                    <ArrowRight size={18} style={{ color: 'var(--brand-teal)' }} />
                  </div>
                </div>
              );
            })}

            {filteredPatients.length === 0 && (
              <div className="empty-state">
                <Users size={48} />
                <p style={{ fontSize: '1rem', marginTop: '12px' }}>{t('empty_patients')}</p>
              </div>
            )}
          </div>

          {/* Synthetic Data Disclaimer Banner */}
          <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)' }}>
            {t('data_disclaimer')}
          </div>
        </>
      )}

      {/* PROMINENT MOBILE-FIRST FLOATING THUMB ACTION BAR */}
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 120, width: 'calc(100% - 40px)', maxWidth: '500px' }}>
        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={() => navigate(`/asha/triage/${patients[0]?.id || 'p1'}`)}
          style={{ height: '56px', fontSize: '1.0625rem', borderRadius: 'var(--radius-full)', boxShadow: '0 12px 30px rgba(13, 148, 136, 0.4)' }}
        >
          <PlusCircle size={22} />
          {t('start_new_visit')}
        </button>
      </div>
    </div>
  );
}
