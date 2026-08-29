import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, ArrowRightLeft, LayoutDashboard, Stethoscope, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getOutreachAlerts } from '../../services/api';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'asha' || user?.role === 'anm') {
      getOutreachAlerts()
        .then(res => setOverdueCount(res.data.length))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const role = user?.role;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div className="brand-icon-box">
          <Activity size={22} />
        </div>
        <div>
          <h1>CareLink AI</h1>
          <div className="logo-sub">Care Coordination</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {(role === 'asha' || role === 'anm') && (
          <>
            <span className="sidebar-section-label">ASHA Suite</span>
            <NavLink to="/asha" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Home size={18} /> My Patients
              {overdueCount > 0 && <span className="nav-badge">{overdueCount}</span>}
            </NavLink>
            <NavLink to="/asha/referrals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ArrowRightLeft size={18} /> Referral Tracker
            </NavLink>
          </>
        )}

        {(role === 'doctor' || role === 'specialist') && (
          <>
            <span className="sidebar-section-label">Doctor Suite</span>
            <NavLink to="/doctor" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Stethoscope size={18} /> Incoming Referrals
            </NavLink>
          </>
        )}

        {role === 'admin' && (
          <>
            <span className="sidebar-section-label">Executive Suite</span>
            <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Quality Dashboard
            </NavLink>
          </>
        )}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
          Active User
        </div>
        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
          {user?.full_name}
        </div>
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--accent-teal)', fontWeight: 600, marginTop: '2px' }}>
          {user?.facility_name}
        </div>
      </div>
    </aside>
  );
}
