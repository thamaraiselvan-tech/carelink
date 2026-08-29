import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, LayoutDashboard, Store, User, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWorkers } from '../services/api';
import Loader from '../components/ui/Loader';

const portals = [
  {
    role: 'asha',
    label: 'ASHA / ANM Suite',
    badge: 'Frontline Field App',
    desc: 'Frontline health worker suite — patient registration, protocol red-flag triage, operational smart facility matching, and structured referrals.',
    icon: Heart,
    color: '#0D9488',
    gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)',
    directRoute: '/asha',
  },
  {
    role: 'doctor',
    label: 'Physician Suite',
    badge: 'Facility Care',
    desc: 'Receiving physician portal — incoming referral queue prioritized by urgency, longitudinal patient records, ICD-10 coding, and closed-loop feedback.',
    icon: Stethoscope,
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    directRoute: '/doctor',
  },
  {
    role: 'admin',
    label: 'Executive Suite',
    badge: 'Quality & Governance',
    desc: 'Executive quality dashboard — referral completion rate, follow-up adherence, facility resource visibility index, and trend analytics.',
    icon: LayoutDashboard,
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
    directRoute: '/admin',
  },
  {
    role: 'kiosk',
    label: 'Village Kiosk Mode',
    badge: 'Public Self-Check',
    desc: 'Public shared device mode for ration shops and panchayats. Icon-first touch UI, session auto-wipe timer, and sensitive topic privacy routing.',
    icon: Store,
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
    directRoute: '/kiosk',
  },
  {
    role: 'patient',
    label: 'Patient OPD Portal',
    badge: 'Personal Care',
    desc: 'Minimal OPD-style portal where patients view personal longitudinal health records, active queue tickets (~15 min wait), and follow-up reminders.',
    icon: User,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    directRoute: '/patient',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [launchingRole, setLaunchingRole] = useState(null);

  useEffect(() => {
    getWorkers().then(res => setWorkers(res.data)).catch(() => {});
  }, []);

  const handleLaunchPortal = async (portal) => {
    setLaunchingRole(portal.label);
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
        login(matchingWorker || { id: 'demo', full_name: `Demo ${portal.label}`, role: portal.role });
        navigate(portal.directRoute);
      }
      setLoading(false);
    }, 350);
  };

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="brand-emblem">
          <Activity size={38} />
        </div>
        <h1 className="landing-title">CareLink AI</h1>
        <p className="landing-subtitle">
          Autonomous Care-Coordination & Digital Triage Engine
        </p>
        <p className="landing-tagline">
          "No patient gets lost between facilities — and no patient is left out because they never knew how to ask."
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
                    {p.badge}
                  </span>
                </div>
                <div className="portal-name">{p.label}</div>
                <div className="portal-desc">{p.desc}</div>
              </div>

              <div className="portal-launch">
                <span>LAUNCH PORTAL</span>
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
        CareLink AI · SIH 2026 Problem Statement SIH26133 · Government of Maharashtra State Innovation Society
      </div>
    </div>
  );
}
