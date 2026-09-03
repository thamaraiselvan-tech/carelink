import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, RotateCcw, ChevronRight, ChevronLeft, BookOpen, Layers, X, Sparkles, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

export default function SihJudgeDemoBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { lang, setLang } = useLang();

  const [activeStep, setActiveStep] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [activeScenario, setActiveScenario] = useState('maternal'); // 'maternal' | 'fever' | 'reroute'
  const [isMinimized, setIsMinimized] = useState(false);

  const steps = [
    { num: 1, title: 'Village Entry', route: '/login', role: null, notes: 'Imagine I am Sunita, a patient from a rural village in Maharashtra. This is my first time using CareLink AI. I choose Marathi language.' },
    { num: 2, title: 'New Patient + Identity', route: '/login', role: null, notes: 'Register new patient Sunita Patil, Age 28. Identity verified in Sandbox mode, creating CareLink Patient ID CL-MH-0001 linked to ABHA ID.' },
    { num: 3, title: 'ASHA-Assisted Profile', route: '/asha', role: 'asha', notes: 'ASHA worker Anita Shinde assists Sunita at Sub-centre Wai. CareLink AI does not assume every rural patient owns a smartphone.' },
    { num: 4, title: 'Symptoms, Vitals & Safety', route: '/asha/triage/p1', role: 'asha', notes: 'Enter headache, swelling of feet, BP 152/96. CareLink outputs URGENT care level and red flags. CareLink does not diagnose; it identifies risk.' },
    { num: 5, title: 'Smart Facility Recommendation', route: '/asha/referral/create/p1', role: 'asha', notes: 'Smart Facility Matcher recommends District Hospital Satara based on OB-GYN specialty, diagnostic capability (Ultrasound), and doctor availability.' },
    { num: 6, title: 'Digital Referral', route: '/asha/referral/create/p1', role: 'asha', notes: 'Click Create Referral CL-REF-00124. Status transitions: CREATED -> NOTIFIED -> CONFIRMED. A referral becomes a trackable digital journey.' },
    { num: 7, title: 'Before the Journey — Queue & Availability', route: '/patient', role: 'patient', notes: 'Don\'t travel blindly! Patient sees District Hospital Satara queue status: 4 ahead, 35 min wait before starting travel.' },
    { num: 8, title: 'Specialist Worklist', route: '/doctor', role: 'doctor', notes: 'Switch to Doctor Suresh Kulkarni at District Hospital Satara. Incoming referral CL-REF-00124 appears in urgent worklist.' },
    { num: 9, title: 'eSanjeevani Consultation', route: '/teleconsultation', role: 'doctor', notes: 'Open eSanjeevani WebRTC room. Review patient vitals HUD, local video feed, and in-call chat.' },
    { num: 10, title: 'Physician e-Prescription', route: '/teleconsultation', role: 'doctor', notes: 'Physician enters ICD-10 diagnosis O14.0 and issues CareLink AI Dual Bilingual A4 PDF e-Prescription.' },
    { num: 11, title: 'Referral Completed', route: '/doctor/referral/r1', role: 'doctor', notes: 'Referral status transitions to COMPLETED. Closed-loop care achieved.' },
    { num: 12, title: 'Follow-Up Scheduled', route: '/doctor/referral/r1', role: 'doctor', notes: 'Doctor schedules ANC 3rd Trimester follow-up for 15 September 2026.' },
    { num: 13, title: 'Longitudinal Patient Timeline', route: '/patient', role: 'patient', notes: 'Patient longitudinal record tracks every event across the health system from registration to prescription.' },
    { num: 14, title: 'Missed Care Detection', route: '/patient', role: 'patient', notes: 'Jump forward in time: 15 Sep follow-up missed. System triggers Overdue Care Alert.' },
    { num: 15, title: 'ASHA Re-engagement', route: '/asha/referrals', role: 'asha', notes: 'ASHA receives overdue care alert for Sunita Patil and dispatches SMS / IVR voice outreach to +91 8428705251.' },
    { num: 16, title: 'Public Health Dashboard', route: '/admin', role: 'admin', notes: 'Executive dashboard reflects completed referral, active follow-ups, and district-wide care coordination metrics.' }
  ];

  const currentStep = steps.find(s => s.num === activeStep) || steps[0];

  const handleResetDemo = () => {
    localStorage.removeItem('carelink_auth_user');
    setActiveStep(1);
    navigate('/login');
  };

  const goToStep = (stepNum) => {
    const target = steps.find(s => s.num === stepNum);
    if (!target) return;

    setActiveStep(stepNum);

    // Set correct role context for the step
    if (target.role === 'asha') {
      login({ id: 'w1', full_name: 'Anita Shinde', role: 'asha', facility_name: 'Sub-centre Wai' });
    } else if (target.role === 'doctor') {
      login({ id: 'doc1', full_name: 'Dr. Suresh Kulkarni', role: 'doctor', facility_name: 'District Hospital Satara' });
    } else if (target.role === 'admin') {
      login({ id: 'admin1', full_name: 'Manoj Thorat (DHO)', role: 'admin', facility_name: 'Satara District Health Office' });
    } else if (target.role === 'patient') {
      login({ id: 'demo_patient', full_name: 'Sunita Patil', role: 'patient', phone: '8428705251', abha_id: '91-8428-7052-5101' });
    }

    if (location.pathname !== target.route) {
      navigate(target.route);
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999999,
          background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
          color: '#FFFFFF',
          border: '2px solid #FFFFFF',
          borderRadius: '9999px',
          padding: '10px 18px',
          fontSize: '0.78125rem',
          fontWeight: 800,
          boxShadow: '0 12px 30px rgba(13, 148, 136, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <Sparkles size={16} /> SIH Live Demo Mode (Step {activeStep}/16)
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999999,
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      color: '#FFFFFF',
      borderBottom: '2px solid #0D9488',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
      fontSize: '0.8125rem'
    }}>
      {/* Left: Branding & Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#0D9488', color: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={14} /> SIH DEMO MODE
        </div>

        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Step {activeStep}/16:</span>
            <span style={{ color: '#FFFFFF' }}>{currentStep.title}</span>
          </div>
        </div>
      </div>

      {/* Center: Scenario Switcher & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={handleResetDemo}
          style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#F87171', padding: '4px 10px', borderRadius: '6px', fontSize: '0.71875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Reset entire Sunita Patil scenario to Step 1"
        >
          <RotateCcw size={12} /> Reset Demo
        </button>

        <button
          onClick={() => goToStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', opacity: activeStep === 1 ? 0.5 : 1 }}
        >
          <ChevronLeft size={14} style={{ display: 'inline' }} /> Prev
        </button>

        <select
          value={activeStep}
          onChange={e => goToStep(Number(e.target.value))}
          style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}
        >
          {steps.map(s => (
            <option key={s.num} value={s.num}>Step {s.num}: {s.title}</option>
          ))}
        </select>

        <button
          onClick={() => goToStep(Math.min(16, activeStep + 1))}
          disabled={activeStep === 16}
          style={{ background: '#0D9488', color: '#FFFFFF', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', opacity: activeStep === 16 ? 0.5 : 1 }}
        >
          Next <ChevronRight size={14} style={{ display: 'inline' }} />
        </button>
      </div>

      {/* Right: Presenter Notes Toggle & Minimize */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setShowNotes(!showNotes)}
          style={{ background: showNotes ? '#2563EB' : 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.71875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <BookOpen size={13} /> Presenter Notes
        </button>

        <button
          onClick={() => setIsMinimized(true)}
          style={{ background: 'transparent', color: '#94A3B8', border: 'none', cursor: 'pointer', padding: '4px' }}
          title="Minimize Stepper Bar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Presenter Notes Popover Modal */}
      {showNotes && (
        <div style={{
          position: 'absolute',
          top: '46px',
          right: '16px',
          background: '#0F172A',
          border: '1px solid rgba(13, 148, 136, 0.4)',
          borderRadius: '14px',
          padding: '16px',
          maxWidth: '380px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 999999
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34D399', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={14} /> Team Presenter Speech Script
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#E2E8F0', lineHeight: 1.5, margin: 0 }}>
            "{currentStep.notes}"
          </p>
        </div>
      )}
    </div>
  );
}
