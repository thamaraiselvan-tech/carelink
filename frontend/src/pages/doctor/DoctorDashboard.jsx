import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ArrowRight, AlertTriangle } from 'lucide-react';
import { getReferrals } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/ui/Loader';

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
    return <Loader text="CareLink AI Physician Queue Loading..." />;
  }

  return (
    <div>
      <div className="page-header-box flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Incoming Referrals Queue</h1>
          <p className="page-subtitle">
            {user?.facility_name} · {user?.full_name} ({user?.specialization || 'Physician'})
          </p>
        </div>
        <div>
          <span className="badge badge-teal" style={{ padding: '8px 16px', fontSize: 'var(--font-sm)' }}>
            {referrals.length} Pending Cases
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-lg">
        {referrals.map(ref => {
          const isEmergency = ref.urgency === 'emergency_review';
          return (
            <div
              key={ref.id}
              className="glass-card interactive"
              onClick={() => navigate(`/doctor/referral/${ref.id}`)}
              style={isEmergency ? { borderColor: 'rgba(225, 29, 72, 0.4)', background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)' } : {}}
            >
              <div className="flex justify-between items-start mb-md" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div className="flex items-center gap-md">
                  <div className="patient-avatar">
                    {ref.patient_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                      <span className="font-bold text-base">{ref.patient_name}</span>
                      <span className="text-xs text-tertiary">({ref.patient_age}y · {ref.patient_gender})</span>
                      <span className={`badge risk-${ref.patient_risk_level}`}>
                        {ref.patient_risk_level} risk
                      </span>
                      <span className={`badge badge-${isEmergency ? 'danger' : ref.urgency === 'urgent' ? 'warning' : 'info'}`}>
                        {ref.urgency?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-tertiary mt-xs">
                      Referred from: <strong className="text-primary">{ref.from_facility_name}</strong> · Category: {ref.complaint_category}
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
              <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)' }}>
                <div className="text-xs text-tertiary font-bold uppercase tracking-wider mb-xs">Structured Clinical Reason:</div>
                <div className="font-semibold text-primary">{ref.reason}</div>
                {ref.symptoms_summary && (
                  <div className="text-xs text-secondary mt-xs">
                    <strong>Symptoms:</strong> {ref.symptoms_summary}
                  </div>
                )}
              </div>
            </div>
          );
        })}

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
