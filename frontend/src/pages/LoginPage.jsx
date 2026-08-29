import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, LayoutDashboard, Store, User, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { getWorkers } from '../services/api';
import Loader from '../components/ui/Loader';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [launchingRole, setLaunchingRole] = useState(null);

  useEffect(() => {
    getWorkers().then(res => setWorkers(res.data)).catch(() => {});
  }, []);

  const portals = [
    {
      role: 'asha',
      key: 'asha_suite',
      badgeKey: 'asha_badge',
      descEn: 'Frontline health worker suite — patient registration, protocol red-flag triage, operational smart facility matching, and structured referrals.',
      descMr: 'आरोग्य सेविका सूट — रुग्ण नोंदणी, रेड-फ्लॅग प्रोटोकॉल, स्मार्ट रुग्णालय जुळणी आणि संदर्भ प्रणाली.',
      icon: Heart,
      color: '#0D9488',
      gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)',
      directRoute: '/asha',
    },
    {
      role: 'doctor',
      key: 'doctor_suite',
      badgeKey: 'doctor_badge',
      descEn: 'Receiving physician portal — incoming referral queue prioritized by urgency, longitudinal patient records, ICD-10 coding, and closed-loop feedback.',
      descMr: 'डॉक्टर पोर्टल — तातडीनुसार येणारे संदर्भ, दीर्घकालीन रुग्ण रेकॉर्ड, ICD-10 कोडिंग आणि अभिप्राय.',
      icon: Stethoscope,
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
      directRoute: '/doctor',
    },
    {
      role: 'admin',
      key: 'executive_suite',
      badgeKey: 'executive_badge',
      descEn: 'Executive quality dashboard — referral completion rate, follow-up adherence, facility resource visibility index, and trend analytics.',
      descMr: 'प्रशासकीय डॅशबोर्ड — संदर्भ पूर्णता दर, पाठपुरावा पालन, साधनसंपत्ती उपलब्धता आणि विश्लेषणात्मक आलेख.',
      icon: LayoutDashboard,
      color: '#7C3AED',
      gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
      directRoute: '/admin',
    },
    {
      role: 'kiosk',
      key: 'kiosk_suite',
      badgeKey: 'kiosk_badge',
      descEn: 'Public shared device mode for ration shops and panchayats. Icon-first touch UI, session auto-wipe timer, and sensitive topic privacy routing.',
      descMr: 'ग्रामपंचायत आणि रेशन दुकानांसाठी सार्वजनिक किऑस्क. आयकॉन-आधारित स्पर्श स्क्रीन, सत्र स्व-साफ टाइमर.',
      icon: Store,
      color: '#D97706',
      gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
      directRoute: '/kiosk',
    },
    {
      role: 'patient',
      key: 'patient_suite',
      badgeKey: 'patient_badge',
      descEn: 'Minimal OPD-style portal where patients view personal longitudinal health records, active queue tickets (~15 min wait), and follow-up reminders.',
      descMr: 'रुग्ण ओपीडी पोर्टल — वैयक्तिक आरोग्य नोंद, अपॉइंटमेंट रांग वेळ (~१५ मिनिटे) आणि स्मरणपत्रे.',
      icon: User,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #10B981, #059669)',
      directRoute: '/patient',
    },
  ];

  const handleLaunchPortal = async (portal) => {
    setLaunchingRole(t(portal.key));
    setLoading(true);
    
    setTimeout(() => {
      if (portal.role === 'kiosk') {
        navigate('/kiosk');
      } else if (portal.role === 'patient') {
        navigate('/patient');
      } else {
        const roleMap = {
          asha: ['asha', 'anm'],
          doctor: ['doctor', 'specialist'],
          admin: ['admin'],
        };
        const matchingWorker = workers.find(w => roleMap[portal.role]?.includes(w.role));
        login(matchingWorker || { id: 'demo', full_name: `Demo ${t(portal.key)}`, role: portal.role });
        navigate(portal.directRoute);
      }
      setLoading(false);
    }, 350);
  };

  return (
    <div className="landing-page">
      {/* Language Switcher in Hero Top Right */}
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
        <div className="lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
          <button className={lang === 'mr' ? 'active' : ''} onClick={() => lang !== 'mr' && toggleLang()}>मराठी</button>
        </div>
      </div>

      <div className="landing-hero">
        <div className="brand-emblem">
          <Activity size={38} />
        </div>
        <h1 className="landing-title">{t('app_name')}</h1>
        <p className="landing-subtitle">
          {t('app_subtitle')}
        </p>
        <p className="landing-tagline">
          "{t('no_patient_lost')}"
        </p>
      </div>

      {loading ? (
        <Loader text={`Opening ${launchingRole}...`} />
      ) : (
        <div className="portal-grid" style={{ maxWidth: '1180px' }}>
          {portals.map((p) => (
            <div
              key={p.role}
              className="portal-card"
              onClick={() => handleLaunchPortal(p)}
            >
              <div>
                <div className="flex justify-between items-center mb-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div className="portal-icon-box" style={{ background: p.gradient, color: '#FFFFFF' }}>
                    <p.icon size={26} />
                  </div>
                  <span className="badge badge-teal" style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}>
                    {t(p.badgeKey)}
                  </span>
                </div>
                <div className="portal-name">{t(p.key)}</div>
                <div className="portal-desc">{lang === 'mr' ? p.descMr : p.descEn}</div>
              </div>

              <div className="portal-launch">
                <span>{t('launch_portal')}</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pillars">
        <span className="pillar">Reach</span>
        <span className="pillar">Route</span>
        <span className="pillar">Remember</span>
        <span className="pillar">Recover</span>
      </div>

      <div className="data-disclaimer">
        {t('data_disclaimer')}
      </div>
    </div>
  );
}
