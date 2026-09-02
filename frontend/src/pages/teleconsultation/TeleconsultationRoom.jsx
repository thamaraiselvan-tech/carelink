import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Activity, FileText, Send, ShieldCheck, User, Building2, ChevronLeft, CheckCircle2, PhoneCall, RefreshCw, Volume2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import EPrescriptionModal from '../../components/teleconsultation/EPrescriptionModal';
import TelephonyDispatcher from '../../components/teleconsultation/TelephonyDispatcher';
import RealtimeCallNetwork from '../../components/teleconsultation/RealtimeCallNetwork';

export default function TeleconsultationRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { lang, t } = useLang();

  const localVideoRef = useRef(null);
  const mainVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [mainView, setMainView] = useState('doctor'); // 'doctor' | 'local'
  const [showChat, setShowChat] = useState(false);
  const [showVitals, setShowVitals] = useState(true);
  const [showPrescription, setShowPrescription] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'System', text: 'eSanjeevani Teleconsultation Session Connected securely.', time: 'Just now' },
    { sender: 'Dr. Kavita Patil', text: 'Hello, I have reviewed the vitals and red flags from Sub-centre Wai. Let us examine the BP trend.', time: '1 min ago' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const patientData = location.state?.patient || {
    id: 'p1',
    full_name: 'Sunita Jadhav',
    full_name_mr: 'सुनीता जाधव',
    age: 26,
    gender: 'Female',
    phone: '8428705251',
    abha_id: '91-8428-7052-5101',
    conditions: ['ANC'],
    risk_level: 'high',
    vitals: { bp: '152/96', temp: '98.6°F', pulse: '84', weight: '58kg' }
  };

  // Start Camera Stream & Bind Video Element
  useEffect(() => {
    let activeStream = null;
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        activeStream = mediaStream;
        setStream(mediaStream);
      } catch (err) {
        console.warn('Camera/Mic permission not granted, using simulated HD video stream:', err.message);
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Bind Stream to Video Element Whenever Stream or View Mode Changes
  useEffect(() => {
    if (stream) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      if (mainVideoRef.current && mainView === 'local') {
        mainVideoRef.current.srcObject = stream;
      }
    }
  }, [stream, mainView, videoActive]);

  // Synthesized Web Audio API Ringtone Sound
  const playRingtone = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 2000);
    } catch (e) {
      console.log('Audio Context ringtone:', e);
    }
  };

  const triggerIncomingCallSimulation = () => {
    playRingtone();
    setIncomingCall(true);
  };

  const toggleMic = () => {
    const nextState = !micActive;
    if (stream) {
      stream.getAudioTracks().forEach(t => t.enabled = nextState);
    }
    setMicActive(nextState);
  };

  const toggleVideo = () => {
    const nextState = !videoActive;
    if (stream) {
      stream.getVideoTracks().forEach(t => t.enabled = nextState);
    }
    setVideoActive(nextState);
  };

  const swapViews = () => {
    setMainView(prev => prev === 'doctor' ? 'local' : 'doctor');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages(prev => [...prev, { sender: user?.full_name || 'Me', text: inputMsg, time: 'Just now' }]);
    setInputMsg('');
  };

  return (
    <div style={{ background: '#0F172A', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* TOP ROOM HEADER */}
      <header style={{
        height: '64px',
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <button className="btn btn-ghost btn-sm" style={{ color: '#94A3B8', padding: '4px 8px' }} onClick={() => navigate(-1)}>
            <ChevronLeft size={18} /> Back
          </button>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>eSanjeevani Teleconsultation Hub</span>
              <span className="badge badge-teal" style={{ fontSize: '10px', flexShrink: 0 }}>ACTIVE SESSION</span>
            </div>
            <div style={{ fontSize: '0.71875rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Spoke: Sub-centre Wai ➔ Hub: District Hospital Satara · Patient: <strong>{patientData.full_name}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <RealtimeCallNetwork phone={patientData.phone} />

          <button className="btn btn-secondary btn-sm" onClick={triggerIncomingCallSimulation} title={`Ring patient ${patientData.phone}`}>
            <PhoneCall size={14} style={{ color: '#10B981' }} /> Ring ({patientData.phone})
          </button>
          
          <TelephonyDispatcher phone={patientData.phone} patientName={patientData.full_name} />
          
          <button className="btn btn-success btn-sm" onClick={() => setShowPrescription(true)}>
            <FileText size={15} /> Issue e-Prescription
          </button>
        </div>
      </header>

      {/* MAIN VIDEO ROOM BODY */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* VIDEO STREAMS VIEWPORT */}
        <div style={{ flex: 1, position: 'relative', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* MAIN SCREEN VIEW (DOCTOR OR LOCAL CAMERA) */}
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mainView === 'doctor' ? (
              /* Doctor View */
              <div style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
                  color: '#FFFFFF',
                  fontSize: '2.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: micActive ? '0 0 50px rgba(13, 148, 136, 0.6)' : '0 0 20px rgba(0,0,0,0.5)',
                  marginBottom: '16px',
                  transition: 'all 0.3s ease'
                }}>
                  KP
                </div>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#FFFFFF' }}>Dr. Kavita Patil (OB-GYN Specialist)</h3>
                <p style={{ fontSize: '0.875rem', color: '#14B8A6', fontWeight: 700, marginTop: '4px' }}>
                  District Hospital Satara · Specialist Teleconsultation Hub
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  <CheckCircle2 size={16} color="#34D399" />
                  <span style={{ fontSize: '0.8125rem', color: '#34D399', fontWeight: 700 }}>Live HD Video Stream Connected</span>
                </div>
              </div>
            ) : (
              /* Local Camera View as Main Screen */
              <div style={{ width: '100%', height: '100%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {videoActive && stream ? (
                  <video
                    ref={mainVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                    <VideoOff size={48} style={{ margin: '0 auto 12px', color: '#E11D48' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Local Camera Off</h3>
                    <p style={{ fontSize: '0.8125rem' }}>Click the camera button in the toolbar to turn video back on.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PICTURE-IN-PICTURE (PIP) CAMERA BOX */}
          <div style={{
            position: 'absolute',
            bottom: '28px',
            right: '28px',
            width: '240px',
            height: '150px',
            background: '#1E293B',
            borderRadius: '18px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
            zIndex: 5
          }}>
            {mainView === 'doctor' ? (
              videoActive ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', background: '#0F172A' }}>
                  <VideoOff size={24} color="#E11D48" />
                  <span style={{ fontSize: '11px', marginTop: '6px', fontWeight: 700 }}>Camera Muted</span>
                </div>
              )
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1E293B' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0D9488', color: '#FFFFFF', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  KP
                </div>
                <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 800, marginTop: '4px' }}>Dr. Kavita Patil</span>
              </div>
            )}

            {/* Swap Main / PiP View Overlay Button */}
            <button
              onClick={swapViews}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Swap main screen and PiP view"
            >
              <RefreshCw size={10} /> Swap View
            </button>

            <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(15, 23, 42, 0.85)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, color: '#F8FAFC' }}>
              {mainView === 'doctor' ? 'My Local Camera' : 'Doctor Specialist Feed'}
            </div>
          </div>

          {/* MIC SPEAKING INDICATOR BANNER */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: micActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(225, 29, 72, 0.2)',
            border: micActive ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(225, 29, 72, 0.4)',
            color: micActive ? '#34D399' : '#F43F5E',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(8px)',
            zIndex: 5
          }}>
            {micActive ? (
              <>
                <Volume2 size={15} style={{ animation: 'pulse 1s infinite' }} />
                <span>🎤 Microphone Active — Transmitting Audio</span>
              </>
            ) : (
              <>
                <MicOff size={15} />
                <span>🔇 Microphone Muted</span>
              </>
            )}
          </div>

          {/* IN-CALL BOTTOM CONTROL TOOLBAR */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 41, 59, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
            zIndex: 6
          }}>
            {/* Mic Toggle Button */}
            <button
              onClick={toggleMic}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: micActive ? '#0D9488' : '#E11D48',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: micActive ? '0 0 16px rgba(13, 148, 136, 0.5)' : 'none',
                transition: 'all 0.2s ease'
              }}
              title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micActive ? <Mic size={22} /> : <MicOff size={22} />}
            </button>

            {/* Video Camera Toggle Button */}
            <button
              onClick={toggleVideo}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: videoActive ? '#2563EB' : '#E11D48',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: videoActive ? '0 0 16px rgba(37, 99, 235, 0.5)' : 'none',
                transition: 'all 0.2s ease'
              }}
              title={videoActive ? 'Turn Off Video Camera' : 'Turn On Video Camera'}
            >
              {videoActive ? <Video size={22} /> : <VideoOff size={22} />}
            </button>

            {/* Chat Toggle Button */}
            <button
              onClick={() => setShowChat(!showChat)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: showChat ? '#7C3AED' : 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Toggle Consultation Chat Drawer"
            >
              <MessageSquare size={22} />
            </button>

            {/* Vitals HUD Toggle Button */}
            <button
              onClick={() => setShowVitals(!showVitals)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: showVitals ? '#0284C7' : 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Toggle Live Patient Vitals HUD"
            >
              <Activity size={22} />
            </button>

            {/* End Call Button */}
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#E11D48',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(225, 29, 72, 0.5)',
                transition: 'all 0.2s ease'
              }}
              title="End Teleconsultation Call"
            >
              <PhoneOff size={26} />
            </button>
          </div>
        </div>

        {/* SIDE PANELS (VITALS HUD & LIVE CHAT) */}
        {(showVitals || showChat) && (
          <div style={{
            width: '340px',
            background: '#1E293B',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* VITALS HUD PANEL */}
            {showVitals && (
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Live Patient Vitals HUD
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px' }}>{patientData.full_name}</h4>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>ABHA: {patientData.abha_id}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(225, 29, 72, 0.3)' }}>
                    <div style={{ fontSize: '10px', color: '#F43F5E', fontWeight: 800 }}>BLOOD PRESSURE</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF' }}>{patientData.vitals?.bp || '152/96'}</div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800 }}>PULSE RATE</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF' }}>{patientData.vitals?.pulse || '84'} bpm</div>
                  </div>
                </div>
              </div>
            )}

            {/* LIVE CHAT DRAWER */}
            {showChat && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>In-Call Consultation Chat</div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 800 }}>{m.sender}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#E2E8F0', marginTop: '2px' }}>{m.text}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                  <input
                    type="text"
                    placeholder="Type clinical note..."
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    style={{ background: '#0F172A', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm"><Send size={14} /></button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULL-SCREEN INCOMING CALL SIMULATION OVERLAY FOR +91 8428705251 */}
      {incomingCall && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(12px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(13, 148, 136, 0.4)',
            color: '#FFFFFF'
          }}>
            <div style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
              color: '#FFFFFF',
              fontSize: '2.25rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 40px rgba(13, 148, 136, 0.6)',
              animation: 'pulse 1.5s infinite'
            }}>
              <PhoneCall size={40} />
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              INCOMING eSANJEEVANI TELECONSULTATION CALL
            </div>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginTop: '6px' }}>Dr. Kavita Patil (OB-GYN)</h2>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '2px' }}>
              District Hospital Satara · Calling +91 8428705251
            </p>

            <div style={{ margin: '24px 0', padding: '12px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', fontSize: '0.75rem', color: '#34D399', fontWeight: 700 }}>
              📞 Audio Ringing on Patient Device Gateway (+91 {patientData.phone})
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-success"
                style={{ flex: 1, height: '48px', fontSize: '0.875rem', fontWeight: 800, borderRadius: '14px' }}
                onClick={() => setIncomingCall(false)}
              >
                <Video size={18} /> Accept & Join Video Call
              </button>

              <a
                href={`tel:+91${patientData.phone}`}
                className="btn btn-secondary"
                style={{ height: '48px', padding: '0 16px', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#FFFFFF' }}
                title="Dial real phone network number"
              >
                📱 Mobile Cellular
              </a>

              <button
                className="btn"
                style={{ background: '#E11D48', color: '#FFFFFF', height: '48px', borderRadius: '14px', padding: '0 16px' }}
                onClick={() => setIncomingCall(false)}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARE LINK AI E-PRESCRIPTION MODAL */}
      <EPrescriptionModal
        isOpen={showPrescription}
        onClose={() => setShowPrescription(false)}
        patient={patientData}
      />
    </div>
  );
}
