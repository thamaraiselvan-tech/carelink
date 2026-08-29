import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ESanjeevaniPosition() {
  return (
    <div className="glass-card">
      <h3 className="section-title" style={{ color: 'var(--accent-purple)' }}>
        Architectural Positioning Relative to eSanjeevani
      </h3>
      <p className="text-secondary text-sm mb-lg">
        SETU does not compete with eSanjeevani — it sits upstream as the digital care-coordination layer that resolves care decisions, tracks referrals end-to-end, and enforces follow-up.
      </p>

      <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-teal)' }}>
            <div className="font-bold text-sm text-teal">SETU Entry & Triage</div>
            <div className="text-xs text-secondary mt-xs">Frontline Assessment · Red-Flag Evaluation · Smart Facility Match</div>
          </div>

          <ArrowRight size={20} className="text-tertiary" />

          <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-purple)' }}>
            <div className="font-bold text-sm text-purple">Care Path Router</div>
            <div className="text-xs text-secondary mt-xs">Physical PHC / Rural Hospital OR eSanjeevani Teleconsultation</div>
          </div>

          <ArrowRight size={20} className="text-tertiary" />

          <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--status-success)' }}>
            <div className="font-bold text-sm text-success">SETU Referral & Follow-up</div>
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
