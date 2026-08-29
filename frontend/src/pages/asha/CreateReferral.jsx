import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { getPatient, getFacilities, createReferral } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import Loader from '../../components/ui/Loader';

export default function CreateReferral() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { lang, t } = useLang();

  const triageData = location.state?.triageResult;
  const recommendedFac = location.state?.recommendedFacility;

  const [patient, setPatient] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    to_facility: recommendedFac?.id || '',
    urgency: triageData?.urgency || 'urgent',
    reason: triageData?.rationale || 'High-risk evaluation required based on triage assessment.',
    symptoms_summary: location.state?.symptoms?.join(', ') || 'Headache, Swelling',
    complaint_category: triageData?.required_specialty || 'Obstetrics',
    duration: '3 days',
    severity: 'high',
    prior_history_summary: '',
  });

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      const [pRes, fRes] = await Promise.all([
        getPatient(patientId),
        getFacilities(),
      ]);
      setPatient(pRes.data);
      setFacilities(fRes.data);

      setForm(prev => ({
        ...prev,
        to_facility: recommendedFac?.id || fRes.data.find(f => f.type === 'district_hospital')?.id || fRes.data[0]?.id,
        prior_history_summary: `${pRes.data.conditions?.join(', ') || 'ANC'} · Previous encounters logged at ${pRes.data.village}`,
      }));
    } catch (err) {
      console.error('Failed to load referral data:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason || form.reason.length < 10) {
      alert('Please provide a structured clinical reason (minimum 10 characters). Single-word referrals are restricted.');
      return;
    }

    setSubmitting(true);
    try {
      await createReferral({
        patient_id: patient.id,
        from_facility: user?.facility_id || facilities[0]?.id,
        to_facility: form.to_facility,
        referred_by: user?.id,
        urgency: form.urgency,
        reason: form.reason,
        symptoms_summary: form.symptoms_summary,
        complaint_category: form.complaint_category,
        duration: form.duration,
        severity: form.severity,
        prior_history_summary: form.prior_history_summary,
      });

      navigate('/asha/referrals');
    } catch (err) {
      console.error('Failed to create referral:', err);
      navigate('/asha/referrals');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <Loader text="CareLink AI Referral Engine..." />;
  }

  return (
    <div>
      <button className="btn btn-ghost mb-lg" onClick={() => navigate(`/asha/patient/${patientId}`)}>
        <ArrowLeft size={16} /> {t('cancel_referral')}
      </button>

      <div className="glass-card mb-xl">
        <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
          {t('create_structured_referral')}
        </h1>
        <p className="text-secondary text-sm">
          {t('mandatory_fields_notice')}
        </p>

        <form onSubmit={handleSubmit} className="mt-xl">
          {/* Patient summary */}
          <div className="form-group mb-lg" style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <span className="text-xs text-tertiary font-bold uppercase tracking-wider">{t('target_patient')}</span>
            <div className="font-bold text-base">
              {lang === 'mr' && patient?.full_name_mr ? patient.full_name_mr : patient?.full_name} ({patient?.age}y, {patient?.gender})
            </div>
          </div>

          <div className="form-row mb-lg">
            <div className="form-group">
              <label className="form-label">{t('destination_facility')}</label>
              <select
                value={form.to_facility}
                onChange={e => setForm({ ...form, to_facility: e.target.value })}
                required
              >
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {lang === 'mr' && f.name_mr ? f.name_mr : f.name} ({f.type.replace('_', ' ').toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('urgency_level')}</label>
              <select
                value={form.urgency}
                onChange={e => setForm({ ...form, urgency: e.target.value })}
              >
                <option value="routine">{t('urgency_routine')}</option>
                <option value="urgent">{t('urgency_urgent')}</option>
                <option value="emergency_review">{t('urgency_emergency_review')}</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-lg">
            <label className="form-label">{t('structured_clinical_reason')}</label>
            <textarea
              rows={3}
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="Detailed reason for referral..."
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            <Send size={18} /> {t('submit_referral_btn')}
          </button>
        </form>
      </div>
    </div>
  );
}
