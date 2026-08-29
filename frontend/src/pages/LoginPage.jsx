import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, LayoutDashboard, Users, ArrowRight, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWorkers } from '../services/api';
import Loader from '../components/ui/Loader';

const roles = [
  {
    role: 'asha',
    label: 'ASHA / ANM Portal',
    badge: 'Frontline Care',
    desc: 'Frontline health worker suite — patient registration, protocol red-flag triage, operational smart facility matching, and structured referrals.',
    icon: Heart,
    color: '#0D9488',
    gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)',
  },
  {
    role: 'doctor',
    label: 'Doctor Portal',
    badge: 'Facility Care',
    desc: 'Receiving physician portal — incoming referral queue prioritized by urgency, longitudinal patient records, and closed-loop feedback.',
    icon: Stethoscope,
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
  },
  {
    role: 'admin',
    label: 'Administrator Portal',
    badge: 'Quality & Governance',
    desc: 'Executive quality dashboard — referral completion rate, follow-up adherence, facility resource visibility index, and trend analytics.',
    icon: LayoutDashboard,
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
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

  const handleLogin = async (roleConfig) => {
    setLaunchingRole(roleConfig.label);
    setLoading(true);
    
    // Smooth loader delay for premium feel
    setTimeout(async () => {
      try {
        const roleMap = {
          asha: ['asha', 'anm'],
          doctor: ['doctor', 'specialist'],
          admin: ['admin'],
        };
        const matchingWorker = workers.find(w => roleMap[roleConfig.role].includes(w.role));
        
        if (matchingWorker) {
          login(matchingWorker);
        } else {
          login({
            id: 'demo',
            full_name: `Demo ${roleConfig.label}`,
            role: roleConfig.role,
            facility_name: 'Sub-centre Wai',
            facility_type: 'sub_centre',
          });
        }
        
        if (roleConfig.role === 'asha') navigate('/asha');
        else if (roleConfig.role === 'doctor') navigate('/doctor');
        else navigate('/admin');
      } catch {
        login({
          id: 'demo',
          full_name: `Demo ${roleConfig.label}`,
          role: roleConfig.role,
        });
        if (roleConfig.role === 'asha') navigate('/asha');
        else if (roleConfig.role === 'doctor') navigate('/doctor');
        else navigate('/admin');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="brand-emblem">
          <Activity size={38} />
        </div>
        <h1 className="landing-title">CareLink AI</h1>
        <p className="landing-subtitle">
          Autonomous Care-Coordination & Triage Layer for Public Healthcare
        </p>
        <p className="landing-tagline">
          "No patient gets lost between facilities — and no patient is left out because they never knew how to ask."
        </p>
      </div>

      {loading ? (
        <Loader text={`Initializing ${launchingRole}...`} />
      ) : (
        <div className="portal-grid">
          {roles.map((r) => (
            <div
              key={r.role}
              className="portal-card"
              onClick={() => handleLogin(r)}
            >
              <div>
                <div className="flex justify-between items-center mb-sm">
                  <div className="portal-icon-box" style={{ background: r.gradient, color: '#FFFFFF' }}>
                    <r.icon size={26} />
                  </div>
                  <span className="badge badge-teal" style={{ background: `${r.color}15`, color: r.color }}>
                    {r.badge}
                  </span>
                </div>
                <div className="portal-name">{r.label}</div>
                <div className="portal-desc">{r.desc}</div>
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
        CareLink AI · Problem Statement SIH26133 · Government of Maharashtra State Innovation Society
      </div>
    </div>
  );
}
