import { useNavigate } from 'react-router-dom';
import { LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { useState, useEffect } from 'react';

export default function Header() {
  const { logout } = useAuth();
  const { lang, toggleLang } = useLang();
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
          <span>{isOnline ? 'Connected' : 'Offline'}</span>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
          <button className={lang === 'mr' ? 'active' : ''} onClick={() => lang !== 'mr' && toggleLang()}>मराठी</button>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
}
