import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, ClipboardList, ArrowRightLeft, Calendar, AlertTriangle, Stethoscope, Building2 } from 'lucide-react';
import { getPatient, getPatientTimeline } from '../../services/api';
import { useLang } from '../../context/LanguageContext';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState({ records: [], referrals: [], followups: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        getPatient(id),
        getPatientTimeline(id),
      ]);
      setPatient(pRes.data);
      setTimeline(tRes.data);
    } catch (err) {
      console.error('Failed to load patient:', err);
    }
    setLoading(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const formatVitals = (vitals) => {
    if (!vitals) return null;
    const v = typeof vitals === 'string' ? JSON.parse(vitals) : vitals;
    const parts = [];
    if (v.bp) parts.push(`BP: ${v.bp}`);
    if (v.temp) parts.push(`Temp: ${v.temp}°F`);
    if (v.pulse) parts.push(`Pulse: ${v.pulse}`);
    if (v.spo2) parts.push(`SpO₂: ${v.spo2}%`);
    if (v.weight) parts.push(`Weight: ${v.weight}kg`);
    return parts.join(' · ');
  };

  // Build unified timeline events
  const buildTimeline = () => {
    const events = [];
    
    timeline.records?.forEach(r => {
      events.push({
        type: 'record',
        date: r.created_at,
        title: r.record_type === 'vitals' ? 'Vitals Recorded' : r.record_type === 'consultation' ? 'Consultation' : r.record_type === 'assessment' ? 'Assessment' : r.record_type,
        facility: r.facility_name,
        facilityType: r.facility_type,
        recordedBy: r.recorded_by_name,
        detail: r.notes,
        vitals: formatVitals(r.vitals),
        diagnosis: r.diagnosis,
        urgency: r.assessment_urgency,
        redFlags: r.red_flags_detected,
        className: r.assessment_urgency === 'emergency_review' ? 'urgent' : r.assessment_urgency === 'urgent' ? 'warning' : 'completed',
        icon: r.record_type === 'consultation' ? Stethoscope : Activity,
      });
    });

    timeline.referrals?.forEach(r => {
      events.push({
        type: 'referral',
        date: r.created_at,
        title: `Referral — ${r.status.replace('_', ' ')}`,
        facility: `${r.from_facility_name} → ${r.to_facility_name}`,
        detail: r.reason,
        urgency: r.urgency,
        status: r.status,
        feedback: r.feedback_to_referrer,
        outcome: r.consultation_outcome,
        className: r.status === 'completed' || r.status === 'closed' ? 'completed' : r.status === 'missed' ? 'urgent' : '',
        icon: ArrowRightLeft,
      });
    });

    timeline.followups?.forEach(f => {
      const isOverdue = f.status === 'scheduled' && new Date(f.due_date) < new Date();
      events.push({
        type: 'followup',
        date: f.due_date,
        title: `Follow-up: ${f.follow_up_type?.replace('_', ' ')}`,
        detail: f.notes,
        status: isOverdue ? 'overdue' : f.status,
        assignedTo: f.assigned_to_name,
        className: isOverdue ? 'urgent' : f.status === 'completed' ? 'completed' : '',
        icon: Calendar,
      });
    });

    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  if (loading) {
    return <div className="flex items-center" style={{ justifyContent: 'center', minHeight: '400px' }}><Activity size={32} style={{ animation: 'pulse-badge 1.5s infinite', color: 'var(--text-tertiary)' }} /></div>;
  }

  if (!patient) {
    return <div className="empty-state"><p>Patient not found</p></div>;
  }

  const events = buildTimeline();
  const overdueFollowups = timeline.followups?.filter(f => f.status === 'scheduled' && new Date(f.due_date) < new Date()) || [];

  return (
    <div>
      {/* Back button */}
      <button className="btn btn-ghost mb-lg" onClick={() => navigate('/asha')}>
        <ArrowLeft size={16} /> Back to patients
      </button>

      {/* Patient Header */}
      <div className="glass-card mb-xl">
        <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
          <div className="patient-avatar" style={{ width: 60, height: 60, fontSize: 'var(--font-xl)' }}>
            {patient.full_name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>
              {lang === 'mr' && patient.full_name_mr ? patient.full_name_mr : patient.full_name}
            </h2>
            <div className="text-secondary text-sm mt-sm" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span>{patient.age}y · {patient.gender}</span>
              <span>📍 {patient.village}, {patient.taluka}</span>
              {patient.blood_group && <span>🩸 {patient.blood_group}</span>}
              {patient.phone && <span>📱 {patient.phone}</span>}
            </div>
            <div className="flex gap-sm mt-md" style={{ flexWrap: 'wrap' }}>
              <span className={`badge risk-${patient.risk_level}`}>{patient.risk_level} risk</span>
              {patient.conditions?.map(c => (
                <span key={c} className="badge badge-purple">{c}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-primary" onClick={() => navigate(`/asha/triage/${patient.id}`)}>
              <ClipboardList size={16} /> Start Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Overdue Follow-ups Warning */}
      {overdueFollowups.length > 0 && (
        <div className="alert-banner emergency mb-xl">
          <div className="alert-icon"><AlertTriangle size={20} /></div>
          <div className="alert-content">
            <div className="alert-title">{overdueFollowups.length} overdue follow-up(s)</div>
            <div className="alert-subtitle">
              {overdueFollowups.map((f, i) => (
                <div key={f.id}>
                  {f.follow_up_type?.replace('_', ' ')} — due {formatDate(f.due_date)} · {Math.floor((new Date() - new Date(f.due_date)) / (1000 * 60 * 60 * 24))} days overdue
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <h3 className="section-title">
        <Activity size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
        Patient Journey Timeline
      </h3>

      <div className="timeline">
        {events.map((event, i) => (
          <div key={i} className={`timeline-event ${event.className}`}>
            <div className="event-date">{formatDate(event.date)}</div>
            {event.facility && <div className="event-facility"><Building2 size={12} style={{ display: 'inline', marginRight: '4px' }} />{event.facility}</div>}
            <div className="event-content">
              <div className="event-title">
                <event.icon size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                {event.title}
                {event.urgency && (
                  <span className={`badge badge-${event.urgency === 'emergency_review' ? 'danger' : event.urgency === 'urgent' ? 'warning' : 'info'}`} style={{ marginLeft: '8px', fontSize: '10px' }}>
                    {event.urgency}
                  </span>
                )}
                {event.status && event.type === 'followup' && (
                  <span className={`badge badge-${event.status === 'overdue' ? 'danger' : event.status === 'completed' ? 'success' : 'info'}`} style={{ marginLeft: '8px', fontSize: '10px' }}>
                    {event.status}
                  </span>
                )}
                {event.status && event.type === 'referral' && (
                  <span className={`badge ref-${event.status}`} style={{ marginLeft: '8px', fontSize: '10px' }}>
                    {event.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              {event.vitals && <div className="event-detail">📊 {event.vitals}</div>}
              {event.diagnosis && <div className="event-detail">🏥 {event.diagnosis}</div>}
              {event.detail && <div className="event-detail">{event.detail}</div>}
              {event.feedback && (
                <div className="event-detail" style={{ color: 'var(--status-success)', marginTop: '4px' }}>
                  ✅ Doctor feedback: {event.feedback}
                </div>
              )}
              {event.outcome && (
                <div className="event-detail" style={{ marginTop: '4px' }}>
                  📋 Outcome: {event.outcome}
                </div>
              )}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="empty-state">
            <p>No records yet for this patient</p>
          </div>
        )}
      </div>
    </div>
  );
}
