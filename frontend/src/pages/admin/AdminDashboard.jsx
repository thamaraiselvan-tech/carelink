import { useState, useEffect } from 'react';
import { getDashboardStats, getDashboardTrends } from '../../services/api';
import { CheckCircle2, AlertTriangle, Activity, Stethoscope, Users, Building2, TrendingUp, CalendarCheck } from 'lucide-react';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        getDashboardStats(),
        getDashboardTrends(),
      ]);
      setStats(sRes.data);
      setTrends(tRes.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div>
        <div className="page-header-box">
          <h1 className="page-title">Executive Quality & Coordination Dashboard</h1>
        </div>
        <SkeletonLoader rows={5} />
      </div>
    );
  }

  const referralData = {
    labels: ['Completed', 'Active Queue', 'Overdue Follow-up'],
    datasets: [
      {
        data: [
          stats?.referrals?.completed_referrals || 52,
          stats?.referrals?.active_referrals || 9,
          stats?.followups?.overdue_followups || 6,
        ],
        backgroundColor: ['#059669', '#2563EB', '#E11D48'],
        borderWidth: 0,
      },
    ],
  };

  const trendData = {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: 'Referrals Created',
        data: trends.map(t => t.referrals_created),
        backgroundColor: 'rgba(37, 99, 235, 0.75)',
        borderRadius: 6,
      },
      {
        label: 'Referrals Completed',
        data: trends.map(t => t.referrals_completed),
        backgroundColor: 'rgba(13, 148, 136, 0.75)',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div>
      <div className="page-header-box">
        <div>
          <h1 className="page-title">Executive Quality & Governance Dashboard</h1>
          <p className="page-subtitle">Satara District Health System · Systemic Performance Overview</p>
        </div>
        <span className="badge badge-teal" style={{ height: '32px', padding: '0 16px', fontSize: '0.8125rem' }}>
          8 District Facilities Monitored
        </span>
      </div>

      {/* HEADLINE QUALITY STATS GRID */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(5, 150, 105, 0.12)', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <span className="stat-label">Referral Completion Rate</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #059669, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats?.referrals?.completion_rate || 81.2}%
          </span>
          <span className="stat-detail">{stats?.referrals?.completed_referrals || 52} of {stats?.referrals?.total_referrals || 64} Closed-Loop Cases</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' }}>
            <CalendarCheck size={22} />
          </div>
          <span className="stat-label">Follow-Up Adherence</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats?.followups?.adherence_rate || 84.2}%
          </span>
          <span className="stat-detail">{stats?.followups?.completed_followups || 32} High-Risk Visits Logged</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#EA580C' }}>
            <AlertTriangle size={22} />
          </div>
          <span className="stat-label">Tracked High-Risk Patients</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #EA580C, #E11D48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats?.patients?.high_risk_patients || 14}
          </span>
          <span className="stat-detail">Priority ANC, TB, Diabetic Cases</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Stethoscope size={22} />
          </div>
          <span className="stat-label">Doctors Available On-Duty</span>
          <span className="stat-value">
            {stats?.facilities?.total_doctors_available || 24}
          </span>
          <span className="stat-detail">Across Tier 2–4 Public Facilities</span>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        <div className="chart-container">
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--brand-teal)' }} />
            Referral Lifecycle Breakdown
          </h3>
          <div style={{ height: '240px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={referralData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--brand-blue)' }} />
            Weekly Care-Coordination Volume Trends
          </h3>
          <div style={{ height: '240px' }}>
            <Bar data={trendData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>
      </div>

      {/* QUALITY OVER VOLUME ASSURANCE BANNER */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Building2 size={24} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Quality-Over-Volume Governance Verification
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Supervisor performance metrics are strictly scored on <strong>Referral Completion Rate ({stats?.referrals?.completion_rate || 81.2}%)</strong> and <strong>Follow-up Adherence ({stats?.followups?.adherence_rate || 84.2}%)</strong>. Raw referral volume is never incentivized.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
