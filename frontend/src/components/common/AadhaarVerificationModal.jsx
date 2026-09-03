import { useState } from 'react';
import { ShieldCheck, CheckCircle2, KeyRound, Lock, UserCheck, X, AlertCircle } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function AadhaarVerificationModal({ isOpen, onClose, onVerified, defaultAadhaar = '842870525101' }) {
  const { lang, t } = useLang();
  const [step, setStep] = useState(1); // 1: Enter Aadhaar | 2: Enter OTP | 3: Verified
  const [aadhaarNumber, setAadhaarNumber] = useState(defaultAadhaar);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRequestOtp = (e) => {
    e.preventDefault();
    const cleanNumber = aadhaarNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number (उदा. 8428 7052 5101)');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1200);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the OTP sent to linked mobile +91 9677563417');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      if (onVerified) {
        onVerified({
          aadhaar: aadhaarNumber,
          abhaId: '91-8428-7052-5101',
          name: 'Sunita Jadhav',
          status: 'VERIFIED_UIDAI_ABDM'
        });
      }
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '460px',
        width: '100%',
        padding: '28px',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.3)',
        border: '1px solid var(--border-subtle)',
        position: 'relative'
      }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', color: '#94A3B8' }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(13, 148, 136, 0.12)',
            color: 'var(--brand-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
            UIDAI Aadhaar e-KYC Verification
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Ayushman Bharat Digital Mission (ABDM) Integrated Identity Layer
          </p>
        </div>

        {error && (
          <div className="alert-banner" style={{ background: '#FFF1F2', borderColor: '#F43F5E', color: '#BE123C', marginBottom: '16px', fontSize: '0.75rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Enter 12-Digit Aadhaar Number</label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={e => setAadhaarNumber(e.target.value)}
                placeholder="xxxx xxxx xxxx"
                maxLength={14}
                style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'monospace' }}
              />
              <div style={{ fontSize: '0.71875rem', color: '#64748B', marginTop: '4px' }}>
                OTP will be sent to registered mobile: <strong>+91 9677563417</strong>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Requesting UIDAI OTP...' : 'Get Aadhaar OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ background: '#ECFDF5', border: '1px solid #10B981', padding: '10px 14px', borderRadius: '10px', color: '#065F46', fontSize: '0.75rem', marginBottom: '16px' }}>
              🔑 Demo OTP sent to <strong>+91 9677563417</strong>. Enter <strong>654321</strong> to verify.
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="654321"
                maxLength={6}
                style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.2em', textAlign: 'center' }}
              />
            </div>

            <button type="submit" className="btn btn-success btn-block btn-lg" disabled={loading}>
              {loading ? 'Verifying with UIDAI...' : 'Verify OTP & Link ABHA ID'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#065F46' }}>Aadhaar e-KYC Verified Successfully!</h4>
            <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '4px' }}>
              Patient Sunita Jadhav identity verified against UIDAI vault & linked to ABHA ID <strong>91-8428-7052-5101</strong>.
            </p>
            <button className="btn btn-primary btn-block mt-md" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
