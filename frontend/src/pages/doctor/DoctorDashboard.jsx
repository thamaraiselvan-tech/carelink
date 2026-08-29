import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Clock, CheckCircle, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { getReferrals } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const res = await getReferrals({ role: 'doctor', facility_id: user?.facility_id });
      setReferrals(res.data);
    } catch (err) {
      console.error('Failed to load doctor referrals:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center p-xl">Loading Doctor Queue...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="page-title">Incoming Referrals Queue</h1>
          <p className="text-secondary text-sm">
            {user?.facility_name} · {user?.full_name} ({user?.specialization || 'Doctor'})
          </p>
        </div>
        <div className="flex gap-sm">
          <span className="badge badge-teal">{referrals.length} Pending Cases</span>
        </div>
      </div>

      <div className="flex flex-col gap-lg">
        {referrals.map(ref => (
          <div
            key={ref.id}
            className={`glass-card interactive ${ref.urgency === 'emergency_review' ? 'alert-banner emergency' : ''}`}
            onClick={() => navigate(`/doctor/referral/${ref.id}`)}
          >
            <div className="flex justify-between items-start mb-md" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <div className="flex items-center gap-md">
                <div className="patient-avatar">
                  {ref.patient_name?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-sm">
                    <span className="font-bold text-base">{ref.patient_name}</span>
                    <span className="text-xs text-tertiary">({ref.patient_age}y · {ref.patient_gender})</span>
                    <span className={`badge risk-${ref.patient_risk_level}`}>
                      {ref.patient_risk_level} risk
                    </span>
                    <span className={`badge badge-${ref.urgency === 'emergency_review' ? 'danger' : ref.urgency === 'urgent' ? 'warning' : 'info'}`}>
                      {ref.urgency?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-tertiary mt-xs">
                    Referred from: <strong>{ref.from_facility_name}</strong> · Category: {ref.complaint_category}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-md">
                <span className={`badge ref-${ref.status}`}>
                  {ref.status?.replace('_', ' ')}
                </span>
                <ArrowRight size={18} className="text-tertiary" />
              </div>
            </div>

            {/* Structured Complaint Box */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
              <div className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-xs">Structured Clinical Reason:</div>
              <div>{ref.reason}</div>
              {ref.symptoms_summary && (
                <div className="text-xs text-secondary mt-xs">
                  <strong>Symptoms:</strong> {ref.symptoms_summary}
                </div>
              )}
            </div>
          </div>
        ))}

        {referrals.length === 0 && (
          <div className="empty-state">
            <Stethoscope size={48} />
            <p>No incoming referrals pending for review</p>
          </div>
        )}
      </div>
    </div>
  );
}
