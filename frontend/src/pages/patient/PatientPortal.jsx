import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Activity, ArrowRightLeft, Clock, ShieldCheck, Heart } from 'lucide-react';
import { getPatient, getPatientTimeline } from '../../services/api';
import Loader from '../../components/ui/Loader';

export default function PatientPortal() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState({ records: [], referrals: [], followups: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load default patient Sunita Jadhav for patient portal demo
    getPatient('p1')
      .then(pRes => {
        setPatient(pRes.data);
        return getPatientTimeline('p1');
      })
      .then(tRes => setTimeline(tRes.data))
      .catch(err => console.error('Patient portal load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader text="Loading Patient OPD Portal..." />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>
      {/* Patient Header */}
      <header style={{ background: '#FFFFFF', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', boxShadow: 'var(--shadow-card)', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--gradient-brand)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
            {patient?.full_name?.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>{patient?.full_name}</h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              OPD Patient Portal · ID: {patient?.id} · {patient?.age}y, {patient?.gender} · 📍 {patient?.village}
            </div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
          Exit Portal
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Active Appointment & Queue Card */}
        <div className="glass-card">
          <h3 className="section-title">
            <Clock size={18} style={{ color: 'var(--brand-teal)' }} />
            Active Appointment & OPD Queue Status
          </h3>
          {timeline.referrals?.length > 0 ? (
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {timeline.referrals[0].to_facility_name}
                </span>
                <span className={`badge ref-${timeline.referrals[0].status}`}>
                  {timeline.referrals[0].status?.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Category: <strong>{timeline.referrals[0].complaint_category}</strong> · Urgency: {timeline.referrals[0].urgency}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--brand-teal)', marginTop: '8px', fontWeight: 700 }}>
                Estimated Queue Wait Time: ~15 mins
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No active OPD referral queue tickets.</p>
          )}
        </div>

        {/* Follow-up Reminders */}
        <div className="glass-card">
          <h3 className="section-title">
            <Calendar size={18} style={{ color: 'var(--brand-purple)' }} />
            Follow-Up & Vaccination Reminders
          </h3>
          {timeline.followups?.map(f => (
            <div key={f.id} style={{ background: '#FFF1F2', border: '1px solid rgba(225, 29, 72, 0.2)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--status-danger)' }}>
                {f.follow_up_type?.replace('_', ' ').toUpperCase()} — Due: {new Date(f.due_date).toLocaleDateString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {f.notes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Longitudinal Care History */}
      <div className="glass-card" style={{ marginTop: '24px' }}>
        <h3 className="section-title">
          <Activity size={18} style={{ color: 'var(--brand-teal)' }} />
          My Personal Health Record Timeline
        </h3>

        <div className="timeline" style={{ marginTop: '16px' }}>
          {timeline.records?.map(r => (
            <div key={r.id} className="timeline-event completed">
              <div className="event-date">{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div className="event-content">
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{r.record_type?.toUpperCase()} — {r.facility_name}</div>
                {r.diagnosis && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Diagnosis: {r.diagnosis}</div>}
                {r.notes && <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{r.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
