import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Clock, LogOut, CheckCircle2, ShieldAlert, PhoneCall, HeartHandshake, Sparkles, Activity } from 'lucide-react';
import { symptomCatalog } from '../../data/symptoms';

export default function KioskPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3-minute session auto-wipe
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
    // Check sensitive condition (e.g. reproductive health or mental health)
    const isSensitive = selectedSymptoms.some(s => s === 'headache' || s === 'vision_changes'); // demo sensitive trigger check
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
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>CareLink AI — Village Kiosk</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Public Health Portal · Gram Panchayat Kiosk Mode</div>
          </div>
        </div>

        {sessionActive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--status-warning-bg)', color: 'var(--status-warning)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.8125rem', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
              <Clock size={16} /> Session Auto-Wipe: {formatTimer(timeLeft)}
            </div>

            <button className="btn btn-danger btn-sm" onClick={handleEndSession}>
              <LogOut size={14} /> End Session
            </button>
          </div>
        )}
      </header>

      {/* MAIN KIOSK BODY */}
      {!sessionActive ? (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--brand-teal-bg)', color: 'var(--brand-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Store size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Touch Screen to Begin</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '28px' }}>
            Self-service health check & referral token generator. Your session automatically clears for privacy when done.
          </p>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <label className="form-label">Enter Token / Ration Card ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. T-88219"
              value={token}
              onChange={e => setToken(e.target.value)}
              style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.05em' }}
            />
          </div>

          <button className="btn btn-primary btn-block btn-lg" onClick={handleStartSession}>
            Start Private Health Check
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
                This Will Be Discussed Privately
              </h2>
              <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'left', marginBottom: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '12px' }}>
                  🔒 <strong>Privacy Assurance:</strong> Diagnostic details for sensitive health symptoms are never displayed on public kiosk screens to protect patient confidentiality.
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--brand-teal)', fontWeight: 700 }}>
                  <PhoneCall size={18} />
                  <span>Confidential IVR Voice Callback queued to your phone. An ASHA worker will also offer a private home visit.</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Triage Assessment Submitted</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Your health check has been securely logged into the CareLink AI network.
              </p>
            </div>
          )}

          <button className="btn btn-primary btn-block btn-lg" onClick={handleEndSession}>
            End Session & Clear Memory
          </button>
        </div>
      ) : (
        /* ICON-FIRST SYMPTOM INTAKE */
        <div className="glass-card" style={{ maxWidth: '840px', margin: '0 auto', padding: '32px' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '8px' }}>Tap Symptoms You Are Experiencing</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Large touch targets for public kiosk self-service:
          </p>

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
                    boxShadow: isSelected ? '0 4px 14px rgba(13, 148, 136, 0.2)' : 'var(--shadow-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: isSelected ? 'var(--brand-teal)' : 'var(--text-primary)' }}>
                      {sym.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{sym.label_mr}</div>
                  </div>
                  {isSelected && <CheckCircle2 size={22} style={{ color: 'var(--brand-teal)' }} />}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
              {selectedSymptoms.length} symptom(s) selected
            </span>
            <button className="btn btn-primary btn-lg" onClick={handleSubmitKiosk} disabled={selectedSymptoms.length === 0}>
              Submit Self-Check Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
