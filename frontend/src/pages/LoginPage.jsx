import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, LayoutDashboard, Store, User, Lock, ArrowRight, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { getWorkers } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { lang, toggleLang, t } = useLang();

  const [selectedRole, setSelectedRole] = useState('asha');
  const [username, setUsername] = useState('9812345001');
  const [password, setPassword] = useState('••••••••');
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
    { id: 'asha', key: 'asha_suite', badgeKey: 'asha_badge', icon: Heart, color: '#0D9488', route: '/asha' },
    { id: 'doctor', key: 'doctor_suite', badgeKey: 'doctor_badge', icon: Stethoscope, color: '#2563EB', route: '/doctor' },
    { id: 'admin', key: 'executive_suite', badgeKey: 'executive_badge', icon: LayoutDashboard, color: '#7C3AED', route: '/admin' },
    { id: 'patient', key: 'patient_suite', badgeKey: 'patient_badge', icon: User, color: '#059669', route: '/patient' },
    { id: 'kiosk', key: 'kiosk_suite', badgeKey: 'kiosk_badge', icon: Store, color: '#D97706', route: '/kiosk' },
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
          login(matchingWorker || { id: 'demo', full_name: `Demo User (${t(activeConfig.key)})`, role: selectedRole, facility_name: 'District Health Center' });
          navigate(activeConfig.route);
        }
      }, 400);
    }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Top Header Bar */}
      <header style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #0D9488, #2563EB)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)' }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{t('app_name')}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-teal)', fontWeight: 700, marginLeft: '8px', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--brand-teal-bg)' }}>
              {t('secure_healthcare_login')}
            </span>
          </div>
        </div>

        <div className="lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
          <button className={lang === 'mr' ? 'active' : ''} onClick={() => lang !== 'mr' && toggleLang()}>मराठी</button>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 60px', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: '540px' }}>
          
          {/* Role Tab Selector */}
          <div style={{ display: 'flex', background: '#FFFFFF', padding: '6px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)', marginBottom: '20px', gap: '4px', overflowX: 'auto' }}>
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
                    minWidth: '80px',
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isSelected ? `${r.color}15` : 'transparent',
                    color: isSelected ? r.color : 'var(--text-secondary)',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.78125rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={18} />
                  <span>{t(r.badgeKey)}</span>
                </button>
              );
            })}
          </div>

          {/* Centered Trusted Healthcare Login Card */}
          <div className="glass-card" style={{ padding: '36px', boxShadow: '0 20px 48px rgba(15, 23, 42, 0.08)', border: '1px solid var(--border-card)' }}>
            
            {/* Role Header Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `${activeConfig.color}15`, color: activeConfig.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <activeConfig.icon size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {t(activeConfig.key)}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '2px' }}>
                  {selectedRole === 'kiosk' ? t('kiosk_no_login_notice') : t('select_role_prompt')}
                </p>
              </div>
            </div>

            {authSuccess && (
              <div className="alert-banner" style={{ background: '#ECFDF5', borderColor: '#10B981', color: '#047857', marginBottom: '20px' }}>
                <CheckCircle2 size={20} />
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{t('login_success')}</div>
              </div>
            )}

            {/* FORM: Standard Healthcare Role Login */}
            {selectedRole !== 'kiosk' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group mb-md">
                  <label className="form-label">{t('username_or_phone')}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. 9812345001"
                    required
                    style={{ height: '48px', fontSize: '0.9375rem' }}
                  />
                </div>

                <div className="form-group mb-md">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>{t('password')}</label>
                    <a href="#forgot" onClick={e => e.preventDefault()} style={{ fontSize: '0.78125rem', color: 'var(--brand-teal)', fontWeight: 700, textDecoration: 'none' }}>
                      {t('forgot_password')}
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ height: '48px', fontSize: '0.9375rem', paddingRight: '40px' }}
                    />
                    <Lock size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <input type="checkbox" id="remember" defaultChecked style={{ width: 16, height: 16, accentColor: 'var(--brand-teal)' }} />
                  <label htmlFor="remember" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {t('remember_me')}
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={loading || authSuccess}
                  style={{ height: '52px', fontSize: '1rem', background: activeConfig.color, borderColor: activeConfig.color }}
                >
                  {loading ? (
                    <>
                      <div className="sync-dot synced" />
                      <span>{t('authenticating')}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      <span>{t('secure_login_btn')}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* KIOSK ENTRY FORM: Low-friction Public Access */
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group mb-lg">
                  <label className="form-label">{t('token_input_label')}</label>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="e.g. T-99120"
                    style={{ height: '52px', fontSize: '1.125rem', textAlign: 'center', fontWeight: 800, letterSpacing: '0.05em' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={loading || authSuccess}
                  style={{ height: '54px', fontSize: '1.0625rem', background: '#D97706', borderColor: '#D97706' }}
                >
                  <Store size={22} />
                  <span>{t('launch_kiosk_btn')}</span>
                </button>
              </form>
            )}

            {/* Quick Demo Credentials Footer Bar */}
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                {t('quick_demo_access')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelectedRole('asha'); setUsername('9812345001'); }}>
                  Anita Shinde (ASHA)
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelectedRole('doctor'); setUsername('dr.kulkarni@carelink.gov.in'); }}>
                  Dr. Kulkarni (Doctor)
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelectedRole('admin'); setUsername('dho.satara@carelink.gov.in'); }}>
                  Manoj Thorat (Admin)
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
