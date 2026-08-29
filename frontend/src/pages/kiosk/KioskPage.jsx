import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Clock, LogOut, CheckCircle2, HeartHandshake, PhoneCall } from 'lucide-react';
import { symptomCatalog } from '../../data/symptoms';
import { useLang } from '../../context/LanguageContext';

export default function KioskPage() {
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLang();
  const [token, setToken] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [sensitiveTriggered, setSensitiveTriggered] = useState(false);

  useEffect(() => {
    let timer;
    if (sessionActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && sessionActive) {
      handleEndSession();
    }
    return () => clearInterval(timer);
  }, [sessionActive, timeLeft]);

  const handleStartSession = () => {
    setSessionActive(true);
    setTimeLeft(180);
    setCompleted(false);
    setSensitiveTriggered(false);
    setSelectedSymptoms([]);
  };

  const handleEndSession = () => {
    setSessionActive(false);
    setToken('');
    setSelectedSymptoms([]);
    setCompleted(false);
    setSensitiveTriggered(false);
    setTimeLeft(180);
  };

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmitKiosk = () => {
    const isSensitive = selectedSymptoms.some(s => s === 'headache' || s === 'swelling');
    if (isSensitive) {
      setSensitiveTriggered(true);
    }
    setCompleted(true);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>
      {/* Top Kiosk Header */}
      <header style={{ background: '#FFFFFF', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--gradient-brand)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('kiosk_title')}</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t('kiosk_subtitle')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
            <button className={lang === 'mr' ? 'active' : ''} onClick={() => lang !== 'mr' && toggleLang()}>मराठी</button>
          </div>

          {sessionActive && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--status-warning-bg)', color: 'var(--status-warning)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.8125rem', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                <Clock size={16} /> {formatTimer(timeLeft)}
              </div>

              <button className="btn btn-danger btn-sm" onClick={handleEndSession}>
                <LogOut size={14} /> {t('end_session')}
              </button>
            </>
          )}
        </div>
      </header>

      {/* MAIN KIOSK BODY */}
      {!sessionActive ? (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--brand-teal-bg)', color: 'var(--brand-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Store size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>{t('kiosk_welcome')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '28px' }}>
            {t('kiosk_instructions')}
          </p>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <label className="form-label">{t('token_input_label')}</label>
            <input
              type="text"
              placeholder="e.g. T-88219"
              value={token}
              onChange={e => setToken(e.target.value)}
              style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.05em' }}
            />
          </div>

          <button className="btn btn-primary btn-block btn-lg" onClick={handleStartSession}>
            {t('start_session')}
          </button>
        </div>
      ) : completed ? (
        <div className="glass-card" style={{ maxWidth: '640px', margin: '20px auto', textAlign: 'center', padding: '40px' }}>
          {sensitiveTriggered ? (
            /* SENSITIVE TOPIC ROUTING: On-Screen Privacy Protection */
            <div>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--brand-purple-bg)', color: 'var(--brand-purple)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <HeartHandshake size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                {t('kiosk_privacy_title')}
              </h2>
              <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'left', marginBottom: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '12px' }}>
                  🔒 <strong>{t('kiosk_privacy_desc')}</strong>
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--brand-teal)', fontWeight: 700 }}>
                  <PhoneCall size={18} />
                  <span>{lang === 'mr' ? 'गोपनीय IVR व्हॉइस कॉल तुमच्या फोनवर पाठवला गेला आहे.' : 'Confidential IVR Voice Callback queued to your phone.'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
                {lang === 'mr' ? 'आरोग्य तपासणी सबमिट केली' : 'Triage Assessment Submitted'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {lang === 'mr' ? 'तुमची माहिती केरलिंक AI नेटवर्कमध्ये सुरक्षितपणे नोंदवली गेली आहे.' : 'Your health check has been securely logged into the CareLink AI network.'}
              </p>
            </div>
          )}

          <button className="btn btn-primary btn-block btn-lg" onClick={handleEndSession}>
            {t('end_session')}
          </button>
        </div>
      ) : (
        /* ICON-FIRST SYMPTOM INTAKE */
        <div className="glass-card" style={{ maxWidth: '840px', margin: '0 auto', padding: '32px' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '8px' }}>
            {lang === 'mr' ? 'तुम्हाला जाणवणारी लक्षणे टॅप करा' : 'Tap Symptoms You Are Experiencing'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {symptomCatalog.map(sym => {
              const isSelected = selectedSymptoms.includes(sym.id);
              return (
                <button
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  style={{
                    height: '64px',
                    padding: '0 20px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--brand-teal-bg)' : '#FFFFFF',
                    border: `2px solid ${isSelected ? 'var(--brand-teal)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: isSelected ? 'var(--brand-teal)' : 'var(--text-primary)' }}>
                      {lang === 'mr' ? sym.label_mr : sym.label}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={22} style={{ color: 'var(--brand-teal)' }} />}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
              {selectedSymptoms.length} {lang === 'mr' ? 'लक्षणे निवडली' : 'symptom(s) selected'}
            </span>
            <button className="btn btn-primary btn-lg" onClick={handleSubmitKiosk} disabled={selectedSymptoms.length === 0}>
              {t('submit_assessment')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
