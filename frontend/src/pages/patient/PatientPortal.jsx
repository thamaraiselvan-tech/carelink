import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Clock, Calendar, LogOut, ArrowRight, ShieldCheck, Stethoscope, Building2 } from 'lucide-react';
import { getPatient, getPatientTimeline } from '../../services/api';
import { useLang } from '../../context/LanguageContext';

export default function PatientPortal() {
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLang();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState({ records: [], referrals: [], followups: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        getPatient('p1'),
        getPatientTimeline('p1'),
      ]);
      setPatient(pRes.data || { id: 'p1', full_name: 'Sunita Jadhav', age: 26, gender: 'Female', village: 'Wai' });
      setTimeline(tRes.data || { records: [], referrals: [], followups: [] });
    } catch (err) {
      console.error('Failed to load patient portal data:', err);
    }
    setLoading(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px 16px 60px' }}>
      {/* Top Patient Header */}
      <header style={{ maxWidth: '800px', margin: '0 auto 24px', background: '#FFFFFF', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-card)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--gradient-brand)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
            {patient?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {lang === 'mr' && patient?.full_name_mr ? patient.full_name_mr : patient?.full_name || 'Sunita Jadhav'}
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              {t('opd_portal_title')} · ID: {patient?.id || 'p1'} · {patient?.age}y, {patient?.gender} · 📍 {patient?.village}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
            <button className={lang === 'mr' ? 'active' : ''} onClick={() => lang !== 'mr' && toggleLang()}>मराठी</button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
            <LogOut size={14} /> {t('exit_portal')}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Active Appointment Ticket Card */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--brand-teal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={20} style={{ color: 'var(--brand-teal)' }} />
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 800 }}>{t('active_appointment')}</h2>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>District Hospital Satara</span>
              <span className="badge badge-teal">OPD Ticket #24</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Category: <strong>Obstetrics (ANC High-Risk Consultation)</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> {t('queue_wait_time')}
            </div>
          </div>
        </div>

        {/* Follow-up Reminders */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--brand-purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Calendar size={20} style={{ color: 'var(--brand-purple)' }} />
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 800 }}>{t('followup_reminders')}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FFF1F2', border: '1px solid rgba(225, 29, 72, 0.2)', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#E11D48' }}>
                ⚠ ANC 3rd Trimester Checkup — Due: 15/08/2026 (Overdue)
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                High-risk follow-up scheduled with Anita Shinde (ASHA Sub-centre Wai). BP monitoring required.
              </div>
            </div>
          </div>
        </div>

        {/* Personal Longitudinal Timeline */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={20} style={{ color: 'var(--brand-blue)' }} />
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 800 }}>{t('personal_timeline')}</h2>
          </div>

          <div className="timeline" style={{ paddingLeft: '8px' }}>
            {/* Record 1 */}
            <div className="timeline-event completed">
              <div className="event-date">10 Apr 2026</div>
              <div className="event-facility"><Building2 size={12} style={{ display: 'inline', marginRight: '4px' }} />Sub-centre Wai</div>
              <div className="event-content">
                <div className="event-title">
                  <Activity size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  ANC Registration Vitals Logged
                </div>
                <div className="event-detail">📊 BP: 118/76 · Temp: 98.2°F · Pulse: 78 · Weight: 54kg</div>
                <div className="event-detail">First ANC registration completed by Anita Shinde (ASHA).</div>
              </div>
            </div>

            {/* Record 2 */}
            <div className="timeline-event completed">
              <div className="event-date">05 Jun 2026</div>
              <div className="event-facility"><Building2 size={12} style={{ display: 'inline', marginRight: '4px' }} />PHC Karjat</div>
              <div className="event-content">
                <div className="event-title">
                  <Stethoscope size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  2nd Trimester OPD Consultation
                </div>
                <div className="event-detail">🏥 Diagnosis: Normal pregnancy progression</div>
                <div className="event-detail">Consultation completed by Dr. Suresh Kulkarni. Fetal heart rate normal.</div>
              </div>
            </div>

            {/* Record 3 */}
            <div className="timeline-event urgent">
              <div className="event-date">15 Jul 2026</div>
              <div className="event-facility"><Building2 size={12} style={{ display: 'inline', marginRight: '4px' }} />Sub-centre Wai</div>
              <div className="event-content">
                <div className="event-title">
                  <Activity size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  3rd Trimester Follow-up Vitals
                </div>
                <div className="event-detail">📊 BP: 152/96 · Temp: 98.6°F · Pulse: 84 · Weight: 58kg</div>
                <div className="event-detail" style={{ color: '#E11D48', fontWeight: 700 }}>⚠ Pre-eclampsia warning signs detected. Emergency referral created.</div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Synthetic Data Disclaimer Banner */}
      <footer style={{ textAlign: 'center', marginTop: '36px', padding: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
        {t('data_disclaimer')}
      </footer>
    </div>
  );
}
