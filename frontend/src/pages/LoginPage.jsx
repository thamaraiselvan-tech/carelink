import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, LayoutDashboard, Store, User, Lock, Eye, EyeOff, Activity, ShieldCheck, CheckCircle2, Phone, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    getWorkers().then(res => setWorkers(res.data)).catch(() => {});
  }, []);

  // Sync pre-filled demo username based on selected role
  useEffect(() => {
    if (selectedRole === 'asha') setUsername('9812345001');
    else if (selectedRole === 'doctor') setUsername('dr.kulkarni@carelink.gov.in');
    else if (selectedRole === 'admin') setUsername('dho.satara@carelink.gov.in');
    else if (selectedRole === 'patient') setUsername('9812345001');
    else if (selectedRole === 'kiosk') setUsername('');
  }, [selectedRole]);

  const rolesConfig = [
    { id: 'asha', key: 'asha_suite', badgeKey: 'asha_badge', icon: Heart, color: '#0D9488', gradient: 'linear-gradient(135deg, #0D9488, #0F766E)', route: '/asha' },
    { id: 'doctor', key: 'doctor_suite', badgeKey: 'doctor_badge', icon: Stethoscope, color: '#2563EB', gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)', route: '/doctor' },
    { id: 'admin', key: 'executive_suite', badgeKey: 'executive_badge', icon: LayoutDashboard, color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)', route: '/admin' },
    { id: 'patient', key: 'patient_suite', badgeKey: 'patient_badge', icon: User, color: '#059669', gradient: 'linear-gradient(135deg, #10B981, #047857)', route: '/patient' },
    { id: 'kiosk', key: 'kiosk_suite', badgeKey: 'kiosk_badge', icon: Store, color: '#D97706', gradient: 'linear-gradient(135deg, #D97706, #B45309)', route: '/kiosk' },
  ];

  const activeConfig = rolesConfig.find(r => r.id === selectedRole) || rolesConfig[0];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setAuthSuccess(true);

      setTimeout(() => {
        if (selectedRole === 'kiosk') {
          navigate('/kiosk');
        } else if (selectedRole === 'patient') {
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Dynamic 3D Ambient Mesh Background */}
      <Background3D />

      {/* Top Header Bar */}
      <header style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'linear-gradient(135deg, #0D9488, #2563EB)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(13, 148, 136, 0.35)' }}>
            <Activity size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{t('app_name')}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-teal)', fontWeight: 800, marginLeft: '10px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--brand-teal-bg)', border: '1px solid rgba(13, 148, 136, 0.2)' }}>
              {t('secure_healthcare_login')}
            </span>
          </div>
        </div>

        <div className="lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
          <button className={lang === 'mr' ? 'active' : ''} onClick={() => lang !== 'mr' && toggleLang()}>मराठी</button>
        </div>
      </header>

      {/* Main Centered Login Card Container */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px 60px', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          
          {/* ROLE TAB BAR WITH HIGH VISUAL HIERARCHY */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '6px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)', marginBottom: '24px', gap: '6px' }}>
            {rolesConfig.map(r => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  style={{
                    flex: 1,
                    padding: '12px 6px',
                    borderRadius: '14px',
                    border: 'none',
                    background: isSelected ? r.gradient : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.78125rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 8px 20px ${r.color}40` : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Icon size={20} />
                  <span>{t(r.badgeKey)}</span>
                </button>
              );
            })}
          </div>

          {/* ELEVATED GLASS LOGIN CARD */}
          <div
            className="glass-card"
            style={{
              padding: '40px',
              borderRadius: '28px',
              boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
            }}
          >
            
            {/* Role Header Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 54, height: 54, borderRadius: '18px', background: activeConfig.gradient, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 24px ${activeConfig.color}35` }}>
                <activeConfig.icon size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {t(activeConfig.key)}
                </h2>
                <p style={{ fontSize: '0.84375rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '3px' }}>
                  {selectedRole === 'kiosk' ? t('kiosk_no_login_notice') : t('select_role_prompt')}
                </p>
              </div>
            </div>

            {authSuccess && (
              <div className="alert-banner" style={{ background: '#ECFDF5', borderColor: '#10B981', color: '#047857', marginBottom: '24px', padding: '14px 18px', borderRadius: '14px' }}>
                <CheckCircle2 size={22} />
                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{t('login_success')}</div>
              </div>
            )}

            {/* FORM: Standard Healthcare Role Login */}
            {selectedRole !== 'kiosk' ? (
              <form onSubmit={handleLoginSubmit}>
                {/* Username Input Field with Inner Icon */}
                <div className="form-group mb-lg">
                  <label className="form-label" style={{ fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                    {t('username_or_phone')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center' }}>
                      <Phone size={18} />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="e.g. 9812345001"
                      required
                      style={{
                        height: '52px',
                        paddingLeft: '48px',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        borderRadius: '14px',
                        border: '1.5px solid var(--border-subtle)',
                        background: '#FFFFFF',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Password Input Field with Inner Lock Icon & Password Visibility Eye Toggle */}
                <div className="form-group mb-lg">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 0 }}>
                      {t('password')}
                    </label>
                    <a href="#forgot" onClick={e => e.preventDefault()} style={{ fontSize: '0.78125rem', color: 'var(--brand-teal)', fontWeight: 700, textDecoration: 'none' }}>
                      {t('forgot_password')}
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center' }}>
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        height: '52px',
                        paddingLeft: '48px',
                        paddingRight: '48px',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        borderRadius: '14px',
                        border: '1.5px solid var(--border-subtle)',
                        background: '#FFFFFF',
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                  <input type="checkbox" id="remember" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--brand-teal)', cursor: 'pointer' }} />
                  <label htmlFor="remember" style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                    {t('remember_me')}
                  </label>
                </div>

                {/* Primary Tactile CTA Button with Gradient & Soft Shadow */}
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={loading || authSuccess}
                  style={{
                    height: '56px',
                    fontSize: '1.0625rem',
                    fontWeight: 800,
                    borderRadius: '16px',
                    background: activeConfig.gradient,
                    borderColor: 'transparent',
                    boxShadow: `0 12px 28px ${activeConfig.color}45`,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {loading ? (
                    <>
                      <div className="sync-dot synced" />
                      <span>{t('authenticating')}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={22} />
                      <span>{t('secure_login_btn')}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* KIOSK ENTRY FORM: Low-friction Public Access */
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group mb-xl">
                  <label className="form-label" style={{ fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                    {t('token_input_label')}
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="e.g. T-99120"
                    style={{ height: '56px', fontSize: '1.1875rem', textAlign: 'center', fontWeight: 800, letterSpacing: '0.08em', borderRadius: '16px', border: '2px solid rgba(217, 119, 6, 0.3)' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={loading || authSuccess}
                  style={{ height: '56px', fontSize: '1.0625rem', fontWeight: 800, borderRadius: '16px', background: 'linear-gradient(135deg, #D97706, #B45309)', borderColor: 'transparent', boxShadow: '0 12px 28px rgba(217, 119, 6, 0.4)' }}
                >
                  <Store size={22} />
                  <span>{t('launch_kiosk_btn')}</span>
                </button>
              </form>
            )}

            {/* DEMO CREDENTIALS INTERACTIVE CHIPS */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                {t('quick_demo_access')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('asha'); setUsername('9812345001'); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(13, 148, 136, 0.3)',
                    background: 'var(--brand-teal-bg)',
                    color: 'var(--brand-teal)',
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Heart size={14} /> Anita Shinde (ASHA)
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('doctor'); setUsername('dr.kulkarni@carelink.gov.in'); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(37, 99, 235, 0.3)',
                    background: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563EB',
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Stethoscope size={14} /> Dr. Kulkarni (Doctor)
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('admin'); setUsername('dho.satara@carelink.gov.in'); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    background: 'rgba(124, 58, 237, 0.08)',
                    color: '#7C3AED',
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <LayoutDashboard size={14} /> Manoj Thorat (Admin)
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', zIndex: 10 }}>
        {t('data_disclaimer')}
      </footer>
    </div>
  );
}
