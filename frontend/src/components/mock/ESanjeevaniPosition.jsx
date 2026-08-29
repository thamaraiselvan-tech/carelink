import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ESanjeevaniPosition() {
  return (
    <div className="glass-card">
      <h3 className="section-title" style={{ color: 'var(--accent-purple)' }}>
        Architectural Positioning Relative to eSanjeevani
      </h3>
      <p className="text-secondary text-sm mb-lg">
        CareLink AI does not compete with eSanjeevani — it sits upstream as the digital care-coordination layer that resolves care decisions, tracks referrals end-to-end, and enforces follow-up.
      </p>

      <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ background: '#FFFFFF', padding: '14px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-teal)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="font-bold text-sm text-teal">CareLink AI Entry & Triage</div>
            <div className="text-xs text-secondary mt-xs">Frontline Assessment · Red-Flag Evaluation · Smart Facility Match</div>
          </div>

          <ArrowRight size={22} className="text-tertiary" />

          <div style={{ background: '#FFFFFF', padding: '14px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-purple)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="font-bold text-sm text-purple">Care Path Router</div>
            <div className="text-xs text-secondary mt-xs">Physical PHC / Rural Hospital OR eSanjeevani Teleconsultation</div>
          </div>

          <ArrowRight size={22} className="text-tertiary" />

          <div style={{ background: '#FFFFFF', padding: '14px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--status-success)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="font-bold text-sm text-success">CareLink AI Referral & Follow-up</div>
            <div className="text-xs text-secondary mt-xs">Closed-Loop Tracker · Feedback-on-Record · Enforced Follow-up</div>
          </div>
        </div>

        <div className="mt-lg pt-md" style={{ borderTop: '1px solid var(--border-glass)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
          <div className="font-semibold text-primary mb-xs">Lancet Regional Health (2024) Redesign Implementation:</div>
          <div>✓ Prevents 65.6% wrong-specialty misrouting via protocol red-flag gate</div>
          <div>✓ Replaces single-word referrals with mandatory structured templates</div>
          <div>✓ Adds explicit re-referral state & closed-loop feedback to frontline ASHA</div>
        </div>
      </div>
    </div>
  );
}
