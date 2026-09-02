import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, AlertTriangle, Activity, LogOut, Video, FileText, Smartphone, Building2, User, PhoneCall, CheckCircle2, Stethoscope, ShieldCheck, Heart } from 'lucide-react';
import AbhaCard from '../../components/teleconsultation/AbhaCard';
import TelephonyDispatcher from '../../components/teleconsultation/TelephonyDispatcher';
import AadhaarVerificationModal from '../../components/common/AadhaarVerificationModal';
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

  const [showAadhaarModal, setShowAadhaarModal] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px 16px 60px' }}>
      <AadhaarVerificationModal
        isOpen={showAadhaarModal}
        onClose={() => setShowAadhaarModal(false)}
        defaultAadhaar="842870525101"
      />
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
              {t('opd_portal_title')}
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
        
        {/* eSanjeevani OPD Live Video Consultation Card */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--brand-purple)', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--brand-purple-bg)', color: 'var(--brand-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>eSanjeevani OPD Video Teleconsultation</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Direct Doctor Video Call · Free MoHFW Telemedicine Service</div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => navigate('/teleconsultation', { state: { patient } })}
            >
              <Video size={16} /> Launch Live Video Consultation Call
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Target Mobile Contact: <strong style={{ color: 'var(--brand-teal)' }}>+91 8428705251</strong>
            </div>
            <TelephonyDispatcher phone={patient?.phone || '8428705251'} patientName={patient?.full_name || 'Sunita Jadhav'} />
          </div>
        </div>

        {/* ABHA DIGITAL HEALTH CARD DISPLAY */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <AbhaCard patient={patient} />
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAadhaarModal(true)} style={{ background: '#FFFFFF', borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)', fontWeight: 800 }}>
            <ShieldCheck size={16} /> Verify 12-Digit Aadhaar e-KYC Identity
          </button>
        </div>

        {/* STEP 7: BEFORE THE JOURNEY — QUEUE & AVAILABILITY VISIBILITY CARD */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '18px', padding: '18px 22px', borderLeft: '5px solid #2563EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} /> Step 7: Before The Journey — Live Queue & Doctor Visibility
            </div>
            <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 800 }}>
              Specialist Available ✓
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '10px' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700 }}>Target Facility</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>District Hospital Satara</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700 }}>Current Patients in Queue</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2563EB' }}>4 Patients Ahead</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700 }}>Estimated Wait Time</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0D9488' }}>~ 35 Minutes</div>
            </div>
          </div>

          <div style={{ fontSize: '0.71875rem', color: '#475569', marginTop: '10px', fontWeight: 600 }}>
            💡 <strong>CareLink AI Value:</strong> Sunita Patil doesn't travel blindly. Live queue & specialist availability are verified <em>before</em> setting out from Village Wai.
          </div>
        </div>

        {/* Active Appointment Ticket Card with Structured Key-Value Table */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--brand-teal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Clock size={20} style={{ color: 'var(--brand-teal)' }} />
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 800 }}>{t('active_appointment')}</h2>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84375rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontWeight: 800, width: '40%', textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                    Facility
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    District Hospital Satara
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                    {t('specialty_category')}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--brand-teal)' }}>
                    Obstetrics (ANC High-Risk)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                    {t('urgency_level')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="badge badge-danger">Emergency Review</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                    {t('est_wait_time')}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#059669' }}>
                    ~15 mins (OPD Ticket #24)
                  </td>
                </tr>
              </tbody>
            </table>
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
