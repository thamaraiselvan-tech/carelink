import { ShieldCheck, QrCode, Smartphone, User, CheckCircle2 } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function AbhaCard({ patient }) {
  const { lang } = useLang();

  const abhaId = patient?.abha_id || '91-8428-7052-5101';
  const abhaAddress = patient?.abha_address || '9342222160@abdm';
  const phone = patient?.phone || '9342222160';
  const name = patient?.full_name || 'Sunita Jadhav';
  const nameMr = patient?.full_name_mr || 'सुनीता जाधव';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      color: '#FFFFFF',
      boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '440px'
    }}>
      {/* Background Emblem Watermark Accent */}
      <div style={{
        position: 'absolute',
        right: '-20px',
        bottom: '-20px',
        opacity: 0.06,
        pointerEvents: 'none'
      }}>
        <ShieldCheck size={180} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#94A3B8', textTransform: 'uppercase' }}>
              Ayushman Bharat Digital Mission
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              ABHA Digital Health Card
            </div>
          </div>
        </div>
        <span style={{
          background: 'rgba(16, 185, 129, 0.18)',
          color: '#34D399',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '0.6875rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <CheckCircle2 size={12} /> ABDM Verified
        </span>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#FFFFFF',
          flexShrink: 0
        }}>
          {name.charAt(0)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#F8FAFC' }}>
            {lang === 'mr' ? nameMr : name}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '2px' }}>
            {patient?.gender || 'Female'} · {patient?.age || 26} yrs · 🩸 {patient?.blood_group || 'B+'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#14B8A6', fontWeight: 700, marginTop: '4px' }}>
            ABHA Address: {abhaAddress}
          </div>
        </div>
      </div>

      {/* ABHA Number & QR Code Bar */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '14px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            14-Digit ABHA Number
          </div>
          <div style={{ fontSize: '1.1875rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.08em', marginTop: '2px', fontFamily: 'monospace' }}>
            {abhaId}
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          padding: '6px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <QrCode size={36} color="#0F172A" />
        </div>
      </div>

      {/* Footer Contact Sync Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.75rem', color: '#94A3B8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Smartphone size={14} color="#14B8A6" />
          <span>Mobile: <strong style={{ color: '#F8FAFC' }}>+91 {phone}</strong></span>
        </div>
        <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600 }}>
          CareLink AI Integrated EHR
        </div>
      </div>
    </div>
  );
}
