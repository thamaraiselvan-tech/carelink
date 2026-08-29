import { useState, useEffect } from 'react';
import { 
  CheckCircle2, ArrowRightLeft, Building2, Activity, Award
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { getDashboardStats, getFacilities } from '../../services/api';
import AccessLadder from '../../components/mock/AccessLadder';
import ESanjeevaniPosition from '../../components/mock/ESanjeevaniPosition';
import Loader from '../../components/ui/Loader';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, facilities, vision
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [sRes, fRes] = await Promise.all([
        getDashboardStats(),
        getFacilities(),
      ]);
      setStats(sRes.data);
      setFacilities(fRes.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setStats({
        patients: { total_patients: 20, high_risk_patients: 6, patients_today: 4 },
        referrals: { total_referrals: 12, completed_referrals: 9, active_referrals: 3, missed_referrals: 1, completion_rate: 75 },
        followups: { total_followups: 15, completed_followups: 11, overdue_followups: 4, adherence_rate: 73 },
        facilities: { total_facilities: 8, total_doctors_available: 18, avg_queue: 12 }
      });
    }
    setLoading(false);
  };

  if (loading) {
    return <Loader text="CareLink AI Executive Dashboard Loading..." />;
  }

  // Chart Data: Referral Completion Rate
  const referralChartData = {
    labels: ['Completed & Closed', 'Active In-Progress', 'Missed'],
    datasets: [{
      data: [stats?.referrals?.completed_referrals || 9, stats?.referrals?.active_referrals || 3, stats?.referrals?.missed_referrals || 1],
      backgroundColor: ['#059669', '#0D9488', '#E11D48'],
      borderColor: '#FFFFFF',
      borderWidth: 2,
    }]
  };

  // Chart Data: Follow-up Adherence
  const followupChartData = {
    labels: ['ANC Checkup', 'Child Immunization', 'TB / Chronic', 'Post-Referral'],
    datasets: [{
      label: 'Completed %',
      data: [85, 90, 72, 78],
      backgroundColor: 'rgba(13, 148, 136, 0.75)',
      borderRadius: 6,
    }]
  };

  // Trend Chart Data
  const trendChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Referrals Completed',
        data: [12, 19, 24, 31],
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'High-Risk Follow-ups Met',
        data: [15, 22, 28, 36],
        borderColor: '#0D9488',
        backgroundColor: 'transparent',
        tension: 0.4,
      }
    ]
  };

  return (
    <div>
      {/* Header & Tabs */}
      <div className="page-header-box flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Quality & Coordination Dashboard</h1>
          <p className="page-subtitle">
            Government of Maharashtra · CareLink AI Executive Monitoring
          </p>
        </div>

        <div className="tab-bar" style={{ marginBottom: 0 }}>
          <button className={`tab-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Executive Overview
          </button>
          <button className={`tab-item ${activeTab === 'facilities' ? 'active' : ''}`} onClick={() => setActiveTab('facilities')}>
            Facility Availability Index
          </button>
          <button className={`tab-item ${activeTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveTab('vision')}>
            System Architecture Vision
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-xl">
          {/* Quality Principle Banner */}
          <div className="alert-banner" style={{ background: 'rgba(13, 148, 136, 0.08)', borderColor: 'rgba(13, 148, 136, 0.3)', borderLeft: '5px solid #0D9488' }}>
            <Award size={26} style={{ color: '#0D9488', flexShrink: 0 }} />
            <div>
              <div className="alert-title" style={{ color: '#0F766E' }}>
                Design Principle: Quality Over Volume Metrics
              </div>
              <div className="alert-subtitle">
                Scored strictly on <strong>Referral Completion Rate</strong> and <strong>Follow-up Adherence</strong>. Zero credit for raw consultation volume to prevent 'ghost consultation' target gaming documented in telemedicine literature.
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(5, 150, 105, 0.12)', color: '#059669' }}><CheckCircle2 size={20} /></div>
              <span className="stat-label">Referral Completion Rate</span>
              <span className="stat-value">{stats?.referrals?.completion_rate || 75}%</span>
              <span className="stat-detail">Target: &gt;70% (State Avg: 42%)</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(13, 148, 136, 0.12)', color: '#0D9488' }}><Activity size={20} /></div>
              <span className="stat-label">Follow-Up Adherence Rate</span>
              <span className="stat-value">{stats?.followups?.adherence_rate || 73}%</span>
              <span className="stat-detail">High-Risk ANC & Chronic</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED' }}><ArrowRightLeft size={20} /></div>
              <span className="stat-label">Tracked Referrals</span>
              <span className="stat-value">{stats?.referrals?.total_referrals || 12}</span>
              <span className="stat-detail">Zero un-tracked handoffs</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(217, 119, 6, 0.12)', color: '#D97706' }}><Building2 size={20} /></div>
              <span className="stat-label">Doctors Available On-Duty</span>
              <span className="stat-value">{stats?.facilities?.total_doctors_available || 18}</span>
              <span className="stat-detail">Across 8 Tier Facilities</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-title">Referral Lifecycle Quality Breakdown</div>
              <div style={{ height: '240px', display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={referralChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-title">Follow-up Adherence by Category (%)</div>
              <div style={{ height: '240px' }}>
                <Bar data={followupChartData} options={{ maintainAspectRatio: false, scales: { y: { max: 100 } } }} />
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="chart-container">
            <div className="chart-title">4-Week Quality & Continuity Progression Trend</div>
            <div style={{ height: '220px' }}>
              <Line data={trendChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}

      {/* FACILITIES TAB */}
      {activeTab === 'facilities' && (
        <div>
          <h3 className="section-title">Public Facility Operational Availability Index</h3>
          <p className="text-secondary text-sm mb-lg">
            Live pre-travel verification proof index across all 4 system tiers in Satara district:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {facilities.map(fac => (
              <div key={fac.id} className="glass-card">
                <div className="flex justify-between items-start mb-sm">
                  <div>
                    <div className="font-bold text-base">{fac.name}</div>
                    <div className="text-xs text-tertiary">{fac.type.replace('_', ' ').toUpperCase()} · Tier {fac.tier}</div>
                  </div>
                  <span className="badge badge-teal">Stock: {fac.medicines_in_stock}%</span>
                </div>

                <div className="text-xs text-secondary mt-sm">
                  <div>📍 Location: {fac.village}, {fac.taluka}</div>
                  <div>👨‍⚕️ Available Doctors: <strong>{fac.doctors_available} / {fac.doctors_total}</strong></div>
                  <div>👥 Current Queue: <strong>{fac.queue_length} patients</strong></div>
                </div>

                <div className="mt-md" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                  <div className="text-xs font-bold text-tertiary mb-xs uppercase tracking-wider">Operational Diagnostics:</div>
                  <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                    {fac.diagnostics_working?.map(d => (
                      <span key={d} className="badge badge-success" style={{ fontSize: '10px' }}>✓ {d}</span>
                    ))}
                    {fac.diagnostics?.filter(d => !fac.diagnostics_working?.includes(d)).map(d => (
                      <span key={d} className="badge badge-danger" style={{ fontSize: '10px' }}>✗ {d} Offline</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISION TAB */}
      {activeTab === 'vision' && (
        <div className="flex flex-col gap-xl">
          <AccessLadder />
          <ESanjeevaniPosition />
        </div>
      )}
    </div>
  );
}
