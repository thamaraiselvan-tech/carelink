import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, Users, ArrowRight, Activity, CalendarX } from 'lucide-react';
import { getPatients, getOutreachAlerts, getFollowUps, getReferrals } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import Loader from '../../components/ui/Loader';

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
      const [pRes, aRes, fRes, rRes] = await Promise.all([
        getPatients(),
        getOutreachAlerts(),
        getFollowUps({ status: 'overdue' }),
        getReferrals({ status: 'created' }),
      ]);
      setPatients(pRes.data);
      setAlerts(aRes.data);

      setStats({
        total: pRes.data.length,
        highRisk: pRes.data.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length,
        overdueFollowups: aRes.data.length,
        activeReferrals: rRes.data.length,
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = !search ||
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.village?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'high_risk' && (p.risk_level === 'high' || p.risk_level === 'critical')) ||
      (filter === 'anc' && p.conditions?.includes('ANC')) ||
      (filter === 'chronic' && (p.conditions?.includes('Diabetes') || p.conditions?.includes('Hypertension') || p.conditions?.includes('TB'))) ||
      (filter === 'children' && p.age <= 5);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <Loader text="CareLink AI ASHA Suite Loading..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-box flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('patients')}</h1>
          <p className="page-subtitle">
            {user?.facility_name} · {user?.full_name}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid mb-xl">
        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>
          <span className="stat-label">Total Registered</span>
          <span className="stat-value">{stats.total}</span>
          <span className="stat-detail">Assigned Households</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#EA580C' }}><AlertTriangle size={20} /></div>
          <span className="stat-label">High Risk</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #EA580C, #E11D48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.highRisk}</span>
          <span className="stat-detail">Priority Monitoring</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(225, 29, 72, 0.12)', color: '#E11D48' }}><CalendarX size={20} /></div>
          <span className="stat-label">{t('overdue_followups')}</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #E11D48, #DC2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.overdueFollowups}</span>
          <span className="stat-detail">Proactive Outreach Flags</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' }}><ArrowRight size={20} /></div>
          <span className="stat-label">Active Referrals</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.activeReferrals}</span>
          <span className="stat-detail">In-Progress Handoffs</span>
        </div>
      </div>

      {/* Outreach Alert Banner */}
      {alerts.length > 0 && (
        <div className="alert-banner emergency mb-xl">
          <div className="alert-icon">
            <AlertTriangle size={22} />
          </div>
          <div className="alert-content">
            <div className="alert-title">⚠ {alerts.length} Proactive Outreach Flag(s) (Overdue Care Events)</div>
            <div className="alert-subtitle">
              {alerts.map((a, i) => (
                <span key={a.patient_id}>
                  {i > 0 && ' · '}
                  <strong>{a.full_name}</strong> — {a.follow_up_type?.replace('_', ' ')} ({a.days_overdue}d overdue)
                </span>
              ))}
            </div>
          </div>
          <button className="btn btn-sm btn-danger" onClick={() => {
            if (alerts[0]) navigate(`/asha/patient/${alerts[0].patient_id}`);
          }}>
            Initiate Visit
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-lg mb-xl" style={{ flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '220px' }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search patients by name or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="tab-bar" style={{ marginBottom: 0, flex: 'none' }}>
          {[
            { key: 'all', label: 'All Patients' },
            { key: 'high_risk', label: 'High Risk' },
            { key: 'anc', label: 'ANC' },
            { key: 'chronic', label: 'Chronic' },
            { key: 'children', label: 'Children' },
          ].map(f => (
            <button key={f.key} className={`tab-item ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patient List */}
      <div className="flex flex-col gap-sm">
        {filteredPatients.map(patient => {
          const isOverdue = alerts.some(a => a.patient_id === patient.id);

          return (
            <div
              key={patient.id}
              className="patient-card"
              onClick={() => navigate(`/asha/patient/${patient.id}`)}
              style={isOverdue ? { borderColor: 'rgba(225, 29, 72, 0.35)', background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)' } : {}}
            >
              <div className="patient-avatar">
                {patient.full_name?.charAt(0)}
              </div>

              <div className="patient-info">
                <div className="patient-name">
                  <span className={`risk-dot ${patient.risk_level}`} />
                  {lang === 'mr' && patient.full_name_mr ? patient.full_name_mr : patient.full_name}
                </div>
                <div className="patient-meta">
                  <span>{patient.age}y · {patient.gender}</span>
                  <span>📍 {patient.village}</span>
                  {patient.last_visit_at && (
                    <span>Last visit: {formatDate(patient.last_visit_at)}</span>
                  )}
                </div>
                {patient.conditions?.length > 0 && (
                  <div className="patient-conditions mt-xs flex gap-xs" style={{ flexWrap: 'wrap' }}>
                    {patient.conditions.map(c => {
                      const config = conditionLabels[c] || { en: c, color: '#64748B' };
                      return (
                        <span
                          key={c}
                          className="badge"
                          style={{ background: `${config.color}15`, color: config.color, border: `1px solid ${config.color}30` }}
                        >
                          {lang === 'mr' ? config.mr : config.en}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="patient-actions flex flex-col items-end gap-xs">
                <span className={`badge ${riskColors[patient.risk_level]}`}>
                  {patient.risk_level} risk
                </span>
                {isOverdue && (
                  <span className="badge badge-danger" style={{ animation: 'pulse-badge 2s infinite' }}>
                    ⚠ {t('overdue')}
                  </span>
                )}
                <ArrowRight size={16} className="text-tertiary" />
              </div>
            </div>
          );
        })}

        {filteredPatients.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <p>No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
