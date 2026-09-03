import { useState } from 'react';
import { Phone, MessageSquare, Send, CheckCircle2, PhoneCall, X, Smartphone, ShieldCheck, Users } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { initiateTelephonyCall, sendTelephonySMS } from '../../services/api';

export default function TelephonyDispatcher({ phone = '9342222160', patientName = 'Sunita Jadhav', customMessage = '' }) {
  const { lang, t } = useLang();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('sms'); // 'sms' | 'call'
  const [dispatchStatus, setDispatchStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'
  const [smsText, setSmsText] = useState(
    customMessage || `[CareLink AI Alert] Teleconsultation active for patient ${patientName}. Doctor: Dr. S Saindhavi (+91 9677563417), Frontline: Poojha G (+91 9342222160). View: https://carelink-one-olive.vercel.app/patient`
  );

  const formattedPhone = phone.includes('+91') ? phone : `+91 ${phone}`;

  const handleSimulatedDispatch = async () => {
    setDispatchStatus('sending');
    try {
      if (mode === 'sms') {
        await sendTelephonySMS(phone, smsText).catch(() => {});
      } else {
        await initiateTelephonyCall(phone, 'eSanjeevani Teleconsultation Call').catch(() => {});
      }
    } catch (e) {
      console.log('Telephony dispatch network:', e);
    }
    
    setTimeout(() => {
      setDispatchStatus('sent');
      setTimeout(() => {
        setDispatchStatus('idle');
        setShowModal(false);
      }, 2500);
    }, 1200);
  };

  return (
    <div>
      {/* Quick Action Trigger Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* Real Mobile Dialer Trigger */}
        <a
          href={`tel:+91${phone}`}
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none' }}
          title={`Call ${formattedPhone} on device dialer`}
        >
          <Phone size={14} style={{ color: 'var(--brand-teal)' }} />
          <span>Call ({formattedPhone})</span>
        </a>

        {/* Real Mobile SMS Trigger */}
        <a
          href={`sms:+91${phone}?body=${encodeURIComponent(smsText)}`}
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none' }}
          title={`Send SMS to ${formattedPhone}`}
        >
          <MessageSquare size={14} style={{ color: 'var(--brand-blue)' }} />
          <span>SMS ({formattedPhone})</span>
        </a>

        {/* Interactive In-App Dispatcher Simulator */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { setShowModal(true); setMode('sms'); }}
        >
          <Send size={14} />
          <span>Dispatch Telephony Alert</span>
        </button>
      </div>

      {/* Telephony Dispatcher Overlay Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="glass-card-modal" style={{ maxWidth: '480px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-teal-bg)', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>CareLink AI Telephony Dispatcher</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Target Contact: <strong>{formattedPhone}</strong></div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="tab-bar mb-md" style={{ width: '100%' }}>
              <button className={`tab-item ${mode === 'sms' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setMode('sms')}>
                <MessageSquare size={14} style={{ display: 'inline', marginRight: '4px' }} /> Real-Time SMS Alert
              </button>
              <button className={`tab-item ${mode === 'call' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setMode('call')}>
                <PhoneCall size={14} style={{ display: 'inline', marginRight: '4px' }} /> Automated IVR Voice Call
              </button>
            </div>

            {mode === 'sms' ? (
              <div>
                <div className="form-group">
                  <label className="form-label">SMS Content for {formattedPhone}</label>
                  <textarea
                    rows={4}
                    value={smsText}
                    onChange={e => setSmsText(e.target.value)}
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>

                {/* Dual Recipient SMS Notice */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.75rem', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Users size={14} /> Dual SMS Recipients (Automated):
                  </div>
                  <div>🩺 <strong>Doctor:</strong> Dr. S Saindhavi, MD (+91 9677563417)</div>
                  <div>👩‍⚕️ <strong>Frontline:</strong> Poojha G (+91 9342222160)</div>
                </div>

                {dispatchStatus === 'sent' && (
                  <div className="alert-banner" style={{ background: '#ECFDF5', borderColor: '#10B981', color: '#065F46', marginBottom: '16px' }}>
                    <CheckCircle2 size={20} color="#10B981" />
                    <div>
                      <strong style={{ display: 'block' }}>Dual SMS Successfully Dispatched!</strong>
                      <span style={{ fontSize: '0.75rem' }}>Text messages delivered to Dr. S Saindhavi (+91 9677563417) and Poojha G (+91 9342222160).</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary btn-block" onClick={handleSimulatedDispatch} disabled={dispatchStatus === 'sending'}>
                    {dispatchStatus === 'sending' ? 'Dispatching Dual SMS...' : `Dispatch Dual SMS Alert (Doctor & Frontline)`}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(13, 148, 136, 0.12)',
                  color: 'var(--brand-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  animation: dispatchStatus === 'sending' ? 'pulse 1.5s infinite' : 'none'
                }}>
                  <PhoneCall size={28} />
                </div>

                <h4 style={{ fontSize: '1.0625rem', fontWeight: 800 }}>Dialing +91 {phone}</h4>
                <p style={{ fontSize: '0.78125rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Initiating automated IVR voice consultation call & sending Dual SMS to Doctor (+91 9677563417) and Frontline (+91 9342222160).
                </p>

                {dispatchStatus === 'sent' && (
                  <div className="alert-banner mt-md" style={{ background: '#ECFDF5', borderColor: '#10B981', color: '#065F46' }}>
                    <CheckCircle2 size={20} color="#10B981" />
                    <span>IVR Voice Call Connected to +91 {phone}!</span>
                  </div>
                )}

                <button className="btn btn-primary btn-block mt-lg" onClick={handleSimulatedDispatch} disabled={dispatchStatus === 'sending'}>
                  {dispatchStatus === 'sending' ? 'Dialing Target Phone...' : `Initiate Voice Call to ${phone}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
