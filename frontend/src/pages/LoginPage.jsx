import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, LayoutDashboard, Store, User, Lock, Eye, EyeOff, Activity, ShieldCheck, CheckCircle2, PhoneCall, Volume2, X, Landmark, Database, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { getWorkers } from '../services/api';
import Background3D from '../components/layout/Background3D';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { lang, toggleLang, t } = useLang();

  const [selectedRole, setSelectedRole] = useState('asha');
  const [username, setUsername] = useState('9812345001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // IVR Telephony Simulation State
  const [showIvrModal, setShowIvrModal] = useState(false);
  const [ivrStep, setIvrStep] = useState(0);

  useEffect(() => {
    getWorkers().then(res => setWorkers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedRole === 'asha') setUsername('9812345001');
    else if (selectedRole === 'doctor') setUsername('dr.kulkarni@carelink.gov.in');
    else if (selectedRole === 'admin') setUsername('dho.satara@carelink.gov.in');
    else if (selectedRole === 'patient') setUsername('9812345001');
    else if (selectedRole === 'kiosk') setUsername('');
  }, [selectedRole]);

  const credentialedRoles = [
    { id: 'asha', key: 'asha_suite', badgeKey: 'asha_badge', icon: Heart, color: '#0D9488', gradient: 'linear-gradient(135deg, #0D9488, #0F766E)', route: '/asha' },
    { id: 'doctor', key: 'doctor_suite', badgeKey: 'doctor_badge', icon: Stethoscope, color: '#2563EB', gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)', route: '/doctor' },
    { id: 'admin', key: 'executive_suite', badgeKey: 'executive_badge', icon: LayoutDashboard, color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)', route: '/admin' },
    { id: 'patient', key: 'patient_suite', badgeKey: 'patient_badge', icon: User, color: '#059669', gradient: 'linear-gradient(135deg, #10B981, #047857)', route: '/patient' },
  ];

  const lowFrictionRoles = [
    { id: 'kiosk', key: 'kiosk_suite', badgeKey: 'kiosk_badge', icon: Store, color: '#D97706', gradient: 'linear-gradient(135deg, #D97706, #B45309)', route: '/kiosk' },
  ];

  const allRoles = [...credentialedRoles, ...lowFrictionRoles];
  const activeConfig = allRoles.find(r => r.id === selectedRole) || credentialedRoles[0];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setAuthSuccess(true);

      setTimeout(() => {
        if (selectedRole === 'kiosk') {
          login({ id: 'demo_kiosk', full_name: 'Sub-centre Wai Kiosk', role: 'kiosk', facility_name: 'Sub-centre Wai' });
          navigate('/kiosk');
        } else if (selectedRole === 'patient') {
          login({ id: 'demo_patient', full_name: 'Sunita Jadhav', role: 'patient', phone: '8428705251', abha_id: '91-8428-7052-5101' });
          navigate('/patient');
        } else {
          const roleMap = {
            asha: ['asha', 'anm'],
            doctor: ['doctor', 'specialist'],
            admin: ['admin'],
          };
          const matchingWorker = workers.find(w => roleMap[selectedRole]?.includes(w.role));
          login(matchingWorker || { id: 'demo', full_name: `Demo User (${t(activeConfig.key)})`, role: selectedRole, facility_name: 'Satara District Health Center' });
          navigate(activeConfig.route);
        }
      }, 400);
    }, 600);
  };

  const startIvrSimulation = () => {
    setShowIvrModal(true);
    setIvrStep(1);
    setTimeout(() => {
      setIvrStep(2);
      setTimeout(() => {
        setIvrStep(3);
      }, 2500);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Dynamic 3D Ambient Mesh Background */}
      <Background3D />

      {/* Top Header Bar */}
      <header style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'linear-gradient(135deg, #0D9488, #2563EB)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)' }}>
            <Activity size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{t('app_name')}</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--brand-teal)', fontWeight: 800, marginTop: '2px', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--brand-teal-bg)', border: '1px solid rgba(13, 148, 136, 0.2)', width: 'fit-content' }}>
              {t('secure_healthcare_login')}
            </span>
          </div>
        </div>

        {/* Government Trust & Governance Badges Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-teal" style={{ height: '28px', fontSize: '0.71875rem' }}>
            <Landmark size={13} /> {t('gov_satara')}
          </span>
          <span className="badge badge-purple" style={{ height: '28px', fontSize: '0.71875rem' }}>
            <Database size={13} /> {t('abdm_aligned')}
          </span>
          <span className="badge badge-info" style={{ height: '28px', fontSize: '0.71875rem' }}>
            <WifiOff size={13} /> {t('offline_first')}
          </span>
        </div>

        <div className="lang-toggle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => navigate('/patient')}
            style={{
              background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} /> 🚀 Launch SIH Judge Live Demo (Sunita Patil)
          </button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
          <button className={lang === 'mr' ? 'active' : ''} onClick={() => lang !== 'mr' && toggleLang()}>मराठी</button>
        </div>
      </header>

      {/* Main Container — 2-COLUMN DESKTOP LAYOUT (Above The Fold on 1366x768) */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px 24px', zIndex: 10, width: '100%' }}>
        
        {/* 2-Column Grid */}
        <div style={{ width: '100%', maxWidth: '1080px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start', marginBottom: '24px' }}>

          {/* LEFT COLUMN: PRIMARY CREDENTIAL GATEWAY CARD */}
          <div
            className="glass-card"
            style={{
              padding: '24px 20px',
              borderRadius: '22px',
              boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              width: '100%',
            }}
          >
            {/* Access Ladder Role Tabs Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                {t('credentialed_group')}
              </div>
              <div className="role-tabs-grid" style={{ display: 'flex', gap: '4px' }}>
                {credentialedRoles.map(r => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: '10px',
                        border: 'none',
                        background: isSelected ? r.gradient : 'var(--bg-tertiary)',
                        color: isSelected ? '#FFFFFF' : '#64748B',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '0.71875rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        cursor: 'pointer',
                        boxShadow: isSelected ? `0 6px 16px ${r.color}40` : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon size={16} />
                      <span>{t(r.badgeKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Header Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: activeConfig.gradient, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px ${activeConfig.color}35`, flexShrink: 0 }}>
                <activeConfig.icon size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {t(activeConfig.key)}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '2px' }}>
                  {t('select_role_prompt')}
                </p>
              </div>
            </div>

            {authSuccess && (
              <div className="alert-banner" style={{ background: '#ECFDF5', borderColor: '#10B981', color: '#047857', marginBottom: '16px', padding: '10px 12px', borderRadius: '12px' }}>
                <CheckCircle2 size={18} />
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{t('login_success')}</div>
              </div>
            )}

            {/* FORM: Standard Healthcare Role Login */}
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                  {t('username_or_phone')}
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center' }}>
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. 9812345001"
                    required
                    style={{ height: '44px', paddingLeft: '42px', fontSize: '0.875rem', fontWeight: 600, borderRadius: '12px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label" style={{ fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 0 }}>
                    {t('password')}
                  </label>
                  <a href="#forgot" onClick={e => e.preventDefault()} style={{ fontSize: '0.71875rem', color: 'var(--brand-teal)', fontWeight: 700, textDecoration: 'none' }}>
                    {t('forgot_password')}
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ height: '44px', paddingLeft: '42px', paddingRight: '42px', fontSize: '0.875rem', fontWeight: 600, borderRadius: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <input type="checkbox" id="remember" defaultChecked style={{ width: 16, height: 16, accentColor: 'var(--brand-teal)' }} />
                <label htmlFor="remember" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                  {t('remember_me')}
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading || authSuccess}
                style={{ height: '46px', fontSize: '0.875rem', fontWeight: 800, borderRadius: '12px', background: activeConfig.gradient, borderColor: 'transparent', boxShadow: `0 8px 20px ${activeConfig.color}40` }}
              >
                {loading ? (
                  <>
                    <div className="sync-dot synced" />
                    <span>{t('authenticating')}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>{t('secure_login_btn')}</span>
                  </>
                )}
              </button>
            </form>

            {/* DEMO CREDENTIALS CHIPS */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                {t('quick_demo_access')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelectedRole('patient'); setUsername('9812345001'); }} style={{ fontSize: '0.71875rem', height: '30px', color: '#059669', background: '#ECFDF5' }}>
                  <User size={13} /> Sunita (Patient)
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelectedRole('asha'); setUsername('9812345001'); }} style={{ fontSize: '0.71875rem', height: '30px' }}>
                  <Heart size={13} /> Anita Shinde
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelectedRole('doctor'); setUsername('dr.kulkarni@carelink.gov.in'); }} style={{ fontSize: '0.71875rem', height: '30px' }}>
                  <Stethoscope size={13} /> Dr. Kulkarni
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelectedRole('admin'); setUsername('dho.satara@carelink.gov.in'); }} style={{ fontSize: '0.71875rem', height: '30px' }}>
                  <LayoutDashboard size={13} /> Manoj Thorat
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TELEPHONY & PUBLIC ACCESS CARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* VOICE / IVR TELEPHONY PROMINENT ACCESSIBILITY BANNER */}
            <div
              className="ivr-telephony-banner"
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: '#FFFFFF',
                borderRadius: '22px',
                padding: '20px',
                boxShadow: '0 16px 36px rgba(15, 23, 42, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'rgba(13, 148, 136, 0.25)', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PhoneCall size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.25 }}>
                    📞 {t('ivr_banner_title')}
                  </div>
                  <span className="badge badge-teal" style={{ height: '22px', fontSize: '0.6875rem', marginTop: '4px' }}>
                    1800-CareLink · +91 8428705251
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.78125rem', color: '#94A3B8', lineHeight: 1.45 }}>
                {t('ivr_banner_desc')}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={startIvrSimulation}
                  className="btn btn-primary"
                  style={{ flex: 1, height: '42px', fontSize: '0.8125rem', fontWeight: 800, borderRadius: '12px', background: 'linear-gradient(135deg, #0D9488, #2563EB)' }}
                >
                  {t('simulate_ivr_btn')}
                </button>
                <a
                  href="tel:+918428705251"
                  className="btn btn-secondary"
                  style={{ height: '42px', padding: '0 12px', color: '#F8FAFC', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  title="Call +91 8428705251"
                >
                  📞 Call
                </a>
              </div>
            </div>

            {/* GRAM PANCHAYAT KIOSK PUBLIC CARD */}
            <div
              className="glass-card"
              style={{
                padding: '20px',
                borderRadius: '22px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(217, 119, 6, 0.2)',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(217, 119, 6, 0.12)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Store size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {t('kiosk_suite')}
                  </h3>
                  <span className="badge badge-warning" style={{ height: '22px', fontSize: '0.6875rem', marginTop: '2px' }}>
                    {t('low_friction_group')}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                {t('kiosk_no_login_notice')}
              </p>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Enter Token (e.g. T-99120)"
                    style={{ height: '40px', fontSize: '0.84375rem', textAlign: 'center', fontWeight: 700, borderRadius: '10px' }}
                  />
                </div>
                <button
                  type="submit"
                  onClick={() => setSelectedRole('kiosk')}
                  className="btn btn-secondary btn-block"
                  style={{ height: '42px', fontSize: '0.8125rem', fontWeight: 800, borderRadius: '12px', color: '#D97706', borderColor: 'rgba(217, 119, 6, 0.3)' }}
                >
                  <Store size={16} />
                  <span>{t('launch_kiosk_btn')}</span>
                </button>
              </form>
            </div>

          </div>

        </div>

        {/* FULL 4-TIER ACCESS LADDER ARCHITECTURE STRIP (Fills bottom desktop viewport frame) */}
        <div style={{ width: '100%', maxWidth: '1080px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: '20px', padding: '18px 24px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', textAlign: 'center' }}>
            {t('access_ladder_heading')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(13, 148, 136, 0.12)', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PhoneCall size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.78125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('tier1_title')}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '1px' }}>{t('tier1_sub')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(217, 119, 6, 0.12)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Store size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.78125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('tier2_title')}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '1px' }}>{t('tier2_sub')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Heart size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.78125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('tier3_title')}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '1px' }}>{t('tier3_sub')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Stethoscope size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.78125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('tier4_title')}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '1px' }}>{t('tier4_sub')}</div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* IVR TELEPHONY SIMULATOR MODAL */}
      {showIvrModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
          <div className="glass-card glass-card-modal" style={{ maxWidth: '440px', width: '100%', padding: '24px', textAlign: 'center', borderRadius: '20px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge badge-teal" style={{ height: '26px', padding: '0 10px' }}>
                {t('ivr_suite')}
              </span>
              <button onClick={() => setShowIvrModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #0D9488, #2563EB)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 10px 24px rgba(13, 148, 136, 0.35)' }}>
              <PhoneCall size={26} />
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '6px' }}>{t('ivr_modal_title')}</h3>

            {ivrStep === 1 && (
              <div style={{ margin: '16px 0', color: 'var(--brand-teal)', fontWeight: 700, fontSize: '0.875rem' }}>
                <div className="sync-dot synced" style={{ display: 'inline-block', marginRight: '6px' }} />
                {t('ivr_calling')}
              </div>
            )}

            {ivrStep === 2 && (
              <div style={{ margin: '16px 0' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>
                  <Volume2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {t('ivr_connected')}
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px', fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {t('ivr_simulated_prompt')}
                </div>
              </div>
            )}

            {ivrStep === 3 && (
              <div style={{ margin: '16px 0' }}>
                <div className="alert-banner" style={{ background: '#ECFDF5', borderColor: '#10B981', color: '#047857', textAlign: 'left', padding: '12px' }}>
                  <CheckCircle2 size={22} />
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                    {t('ivr_result_logged')}
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-secondary btn-block" onClick={() => setShowIvrModal(false)} style={{ marginTop: '12px', height: '40px' }}>
              {t('close_simulator')}
            </button>
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <footer style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.71875rem', color: 'var(--text-tertiary)', zIndex: 10 }}>
        {t('data_disclaimer')}
      </footer>
    </div>
  );
}
