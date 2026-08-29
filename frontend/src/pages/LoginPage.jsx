import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, LayoutDashboard, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWorkers } from '../services/api';

const roles = [
  {
    role: 'asha',
    label: 'ASHA / ANM',
    desc: 'Frontline health worker — patient registration, triage, referrals, follow-up',
    icon: Heart,
    color: '#10B981',
  },
  {
    role: 'doctor',
    label: 'Doctor',
    desc: 'Receive referrals, view patient history, complete consultations',
    icon: Stethoscope,
    color: '#00B4D8',
  },
  {
    role: 'admin',
    label: 'Administrator',
    desc: 'Facility dashboard, quality metrics, system overview',
    icon: LayoutDashboard,
    color: '#7C3AED',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getWorkers().then(res => setWorkers(res.data)).catch(() => {});
  }, []);

  const handleLogin = async (roleConfig) => {
    setLoading(true);
    try {
      // Find a worker matching the role
      const roleMap = {
        asha: ['asha', 'anm'],
        doctor: ['doctor', 'specialist'],
        admin: ['admin'],
      };
      const matchingWorker = workers.find(w => roleMap[roleConfig.role].includes(w.role));
      
      if (matchingWorker) {
        login(matchingWorker);
      } else {
        // Fallback if no workers loaded
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
      // Fallback login without backend
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
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <Users size={36} style={{ color: '#00B4D8' }} />
            <h1>SETU</h1>
          </div>
          <p>Digital Care-Coordination for Rural Public Healthcare</p>
          <p className="tagline">"No patient gets lost between facilities — and no patient is left out because they never knew how to ask."</p>
        </div>

        <div className="role-grid">
          {roles.map((r) => (
            <div
              key={r.role}
              className="role-card"
              onClick={() => !loading && handleLogin(r)}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <div className="role-icon" style={{ background: `${r.color}22`, color: r.color }}>
                <r.icon size={24} />
              </div>
              <div>
                <div className="role-name">{r.label}</div>
                <div className="role-desc">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pillars">
          <span className="pillar">Reach</span>
          <span className="pillar">Route</span>
          <span className="pillar">Remember</span>
          <span className="pillar">Recover</span>
        </div>

        <div className="data-disclaimer" style={{ marginTop: '32px', borderTop: 'none' }}>
          SIH 2026 · Problem Statement SIH26133 · Government of Maharashtra
        </div>
      </div>
    </div>
  );
}
