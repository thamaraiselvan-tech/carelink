import { useNavigate } from 'react-router-dom';
import { LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { useState, useEffect } from 'react';

export default function Header() {
  const { logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="sync-indicator">
          <div className={`sync-dot ${isOnline ? 'synced' : 'offline'}`} />
          <span>{isOnline ? t('connected') : t('offline')}</span>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => {
            const current = localStorage.getItem('carelink_sih_demo_enabled') === 'true';
            const next = !current;
            localStorage.setItem('carelink_sih_demo_enabled', String(next));
            window.dispatchEvent(new CustomEvent('carelink_sih_demo_toggle', { detail: { enabled: next } }));
          }}
          style={{
            background: localStorage.getItem('carelink_sih_demo_enabled') === 'true' ? 'linear-gradient(135deg, #0D9488, #2563EB)' : 'var(--bg-tertiary)',
            color: localStorage.getItem('carelink_sih_demo_enabled') === 'true' ? '#FFFFFF' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.71875rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
          title="Toggle SIH Demo Stepper Bar ON/OFF"
        >
          SIH Demo: {localStorage.getItem('carelink_sih_demo_enabled') === 'true' ? 'ON' : 'OFF'}
        </button>

        <div className="lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
          <button className={lang === 'mr' ? 'active' : ''} onClick={() => lang !== 'mr' && toggleLang()}>मराठी</button>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <LogOut size={15} />
          {t('logout')}
        </button>
      </div>
    </header>
  );
}
