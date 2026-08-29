import { PhoneCall, Smartphone, Store, Radio } from 'lucide-react';

export default function AccessLadder() {
  const tiers = [
    {
      tier: 'Tier 1',
      title: 'Voice / IVR Entry',
      icon: PhoneCall,
      color: '#2563EB',
      desc: 'Missed call trigger callback. Works on ₹500 feature phone. Pure audio, local dialect. Zero app or literacy required.',
    },
    {
      tier: 'Tier 2',
      title: 'ASHA-Assisted Device',
      icon: Smartphone,
      color: '#0D9488',
      desc: 'One shared device per hamlet, operated by frontline ASHA/ANM with symbol & icon-based UI.',
    },
    {
      tier: 'Tier 3',
      title: 'Village Kiosk',
      icon: Store,
      color: '#D97706',
      desc: 'Shared tablet placed at ration shop, panchayat office, or SHG meeting point with token session isolation.',
    },
    {
      tier: 'Tier 4 (Core Differentiator)',
      title: 'Proactive Outreach (Opt-Out)',
      icon: Radio,
      color: '#E11D48',
      desc: 'System detects missed care events & silent population automatically, scheduling door-to-door ASHA visits.',
    },
  ];

  return (
    <div className="glass-card mb-xl">
      <h3 className="section-title" style={{ color: 'var(--accent-teal)' }}>
        Module 0 — The 4-Tier Access Ladder (Zero Barrier Entry)
      </h3>
      <p className="text-secondary text-sm mb-lg">
        Ensures reaching CareLink AI never requires a smartphone, literacy, or the patient acting first.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {tiers.map((t, idx) => (
          <div key={idx} style={{ background: 'var(--bg-tertiary)', border: `1px solid ${t.color}33`, borderRadius: 'var(--radius-md)', padding: '18px' }}>
            <div className="flex items-center gap-sm mb-sm">
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${t.color}15`, color: t.color, display: 'flex', itemsCenter: 'center', justifyContent: 'center' }}>
                <t.icon size={20} />
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: t.color }}>{t.tier}</div>
                <div className="text-sm font-bold">{t.title}</div>
              </div>
            </div>
            <div className="text-xs text-secondary">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
