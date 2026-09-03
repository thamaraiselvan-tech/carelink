import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Sparkles, X, CheckCircle2, Move, FileText, Download } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import EPrescriptionModal from '../teleconsultation/EPrescriptionModal';

export default function VoiceAssistantWidget() {
  const navigate = useNavigate();
  const { lang, setLang } = useLang();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [showWidget, setShowWidget] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Draggable Position State (default bottom area clearing mobile CTAs)
  const [pos, setPos] = useState(() => ({
    x: typeof window !== 'undefined' && window.innerWidth < 768 ? Math.max(16, window.innerWidth - 72) : 260,
    y: typeof window !== 'undefined' && window.innerWidth < 768 ? Math.max(100, window.innerHeight - 150) : Math.max(100, window.innerHeight - 90)
  }));
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';

      rec.onresult = (event) => {
        const text = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(text);

        if (event.results[0].isFinal) {
          processVoiceCommand(text);
        }
      };

      rec.onerror = (err) => {
        console.warn('Speech recognition error:', err.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [lang]);

  // DRAG & DROP MOUSE & TOUCH EVENT HANDLERS
  const handlePointerDown = (e) => {
    isDraggingRef.current = false;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    dragStartRef.current = {
      x: clientX - pos.x,
      y: clientY - pos.y
    };

    const handlePointerMove = (moveEvent) => {
      const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX) || 0;
      const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY) || 0;

      const deltaX = Math.abs(currentX - clientX);
      const deltaY = Math.abs(currentY - clientY);

      if (deltaX > 4 || deltaY > 4) {
        isDraggingRef.current = true;
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 70, currentX - dragStartRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, currentY - dragStartRef.current.y));
      setPos({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);
  };

  const handleButtonClick = () => {
    if (isDraggingRef.current) return; // Ignore click if dragging
    toggleListening();
  };

  const speakText = (text) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Speech synthesis exception:', e);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      setAssistantResponse('Speech recognition initialized. Click quick actions or speak a command.');
      setShowWidget(!showWidget);
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAssistantResponse('Listening for your voice command...');
      setShowWidget(true);
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.log('Recognition start error:', e);
      }
    }
  };

  const triggerPDFDownload = () => {
    setShowRxModal(true);
    setTimeout(() => {
      const printElement = document.getElementById('printable-prescription');
      if (printElement) {
        const printWindow = window.open('', '_blank', 'width=900,height=1200');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>CareLink AI — e-Prescription (Sunita Jadhav)</title>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700;800&display=swap');
                  * { box-sizing: border-box; }
                  body { font-family: 'Inter', 'Noto Sans Devanagari', sans-serif; margin: 0; padding: 24px 32px; color: #0F172A; background: #FFFFFF; }
                  @page { size: A4 portrait; margin: 8mm 10mm; }
                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                  th, td { text-align: left; vertical-align: top; padding: 10px 12px !important; }
                </style>
              </head>
              <body>
                ${printElement.innerHTML}
                <script>
                  window.onload = function() {
                    setTimeout(function() { window.print(); }, 300);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        } else {
          window.print();
        }
      }
    }, 600);
  };

  const processVoiceCommand = (commandText) => {
    const cmd = commandText.toLowerCase().trim();

    // 1. VOICE-ACTIVATED REAL-TIME PRESCRIPTION GENERATION
    if (cmd.includes('generate prescription') || cmd.includes('create prescription') || cmd.includes('write prescription') || cmd.includes('issue prescription') || cmd.includes('dawa') || cmd.includes('औषध') || cmd.includes('प्रिस्क्रिप्शन') || (cmd.includes('prescription') && !cmd.includes('download'))) {
      const reply = lang === 'mr' 
        ? 'सुनीता जाधव यांच्यासाठी रिअल-टाईम ई-प्रिस्क्रिप्शन (डॉ. एस सेंधवी, MD) तयार केले आहे.' 
        : 'Real-time Dual Bilingual e-Prescription generated for Sunita Jadhav by Dr. S Saindhavi, MD.';
      setAssistantResponse(reply);
      speakText(reply);
      setShowRxModal(true);
    }
    // 2. VOICE-ACTIVATED DOWNLOADABLE PRESCRIPTION PDF OPTION
    else if (cmd.includes('download') || cmd.includes('download pdf') || cmd.includes('download prescription') || cmd.includes('save pdf') || cmd.includes('save prescription') || cmd.includes('डाउनलोड') || cmd.includes('पीडीएफ')) {
      const reply = lang === 'mr' 
        ? 'केरलिंक एआय ए४ पीडीएफ ई-प्रिस्क्रिप्शन डाउनलोड केले जात आहे.' 
        : 'Downloading CareLink AI Dual Bilingual A4 PDF e-Prescription for Sunita Jadhav...';
      setAssistantResponse(reply);
      speakText(reply);
      triggerPDFDownload();
    }
    // 3. DIGITAL TRIAGE & VITAL SAFETY ASSESSMENT
    else if (cmd.includes('triage') || cmd.includes('vitals') || cmd.includes('risk') || cmd.includes('तपासणी') || cmd.includes('assessment')) {
      const reply = lang === 'mr' ? 'सुनीता जाधव यांच्या डिजिटल ट्रायज आणि बीपी व्हिटल्स तपासणी कडे जात आहे.' : 'Opening Digital Triage & ANC Safety Assessment for Sunita Jadhav.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/asha/triage/p1'), 800);
    }
    // 4. CREATE DIGITAL REFERRAL
    else if (cmd.includes('create referral') || cmd.includes('refer patient') || cmd.includes('referral form') || cmd.includes('संदर्भ') || cmd.includes('नवीन संदर्भ')) {
      const reply = lang === 'mr' ? 'नवीन डिजिटल संदर्भ (Referral CL-REF-00124) तयार करत आहे.' : 'Opening Digital Referral Creation Form CL-REF-00124.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/asha/referral/create/p1'), 800);
    }
    // 5. REFERRAL TRACKER & MISSED CARE ALERTS
    else if (cmd.includes('referral tracker') || cmd.includes('tracker') || cmd.includes('overdue') || cmd.includes('missed') || cmd.includes('संदर्भांची यादी')) {
      const reply = lang === 'mr' ? 'डिजिटल संदर्भ ट्रॅकर आणि प्रलंबित केअर अलर्ट उघडत आहे.' : 'Opening Digital Referral Tracker & Overdue Care Alerts.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/asha/referrals'), 800);
    }
    // 6. TELECONSULTATION / VIDEO CALL
    else if (cmd.includes('video') || cmd.includes('video call') || cmd.includes('कॉल') || cmd.includes('teleconsultation') || cmd.includes('esanjeevani')) {
      const reply = lang === 'mr' ? 'ई-संजीवनी व्हिडिओ कॉल कक्ष उघडत आहे.' : 'Launching eSanjeevani Teleconsultation Room now.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/teleconsultation'), 800);
    }
    // 7. CALL DOCTOR CELLULAR PHONE (+91 9677563417)
    else if (cmd.includes('call doctor') || cmd.includes('doctor phone') || cmd.includes('doctor mobile') || cmd.includes('डॉक्टर कॉल')) {
      const reply = lang === 'mr' ? 'डॉ. एस सेंधवी यांना +91 9677563417 वर डायरेक्ट कॉल करत आहे.' : 'Dialing Specialist Physician Dr. S Saindhavi, MD on +91 9677563417.';
      setAssistantResponse(reply);
      speakText(reply);
      window.location.href = 'tel:+919677563417';
    }
    // 8. CALL FRONTLINE WORKER CELLULAR PHONE (+91 9342222160)
    else if (cmd.includes('call asha') || cmd.includes('call frontline') || cmd.includes('poojha') || cmd.includes('आशा कॉल')) {
      const reply = lang === 'mr' ? 'आशा अधिकारी पूजा जी यांना +91 9342222160 वर कॉल करत आहे.' : 'Dialing Frontline Field Officer Poojha G on +91 9342222160.';
      setAssistantResponse(reply);
      speakText(reply);
      window.location.href = 'tel:+919342222160';
    }
    // 9. PATIENT PORTAL & ABHA CARD
    else if (cmd.includes('patient') || cmd.includes('पेशंट') || cmd.includes('portal') || cmd.includes('abha') || cmd.includes('timeline')) {
      const reply = lang === 'mr' ? 'केरलिंक पेशंट ओपीडी पोर्टल आणि आभा कार्ड उघडत आहे.' : 'Opening CareLink AI Patient OPD Portal & ABHA Profile.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/patient'), 800);
    }
    // 10. PATIENT PROFILE DETAILS
    else if (cmd.includes('profile') || cmd.includes('sunita') || cmd.includes('सुनीता')) {
      const reply = lang === 'mr' ? 'सुनीता जाधव यांची पेशंट प्रोफाइल उघडत आहे.' : 'Opening Sunita Jadhav Detailed Patient Profile.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/asha/patient/p1'), 800);
    }
    // 11. ASHA DASHBOARD / HOME
    else if (cmd.includes('asha') || cmd.includes(' आशा') || cmd.includes('home')) {
      const reply = lang === 'mr' ? 'आशा केअर कोऑर्डिनेटर डॅशबोर्ड उघडत आहे.' : 'Opening ASHA Care Coordinator Suite.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/asha'), 800);
    }
    // 12. DOCTOR DASHBOARD
    else if (cmd.includes('doctor') || cmd.includes('डॉक्टर') || cmd.includes('worklist')) {
      const reply = lang === 'mr' ? 'डॉक्टर तज्ज्ञ कार्यसूची उघडत आहे.' : 'Navigating to Doctor Specialist Worklist.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/doctor'), 800);
    }
    // 13. ADMIN ANALYTICAL DASHBOARD
    else if (cmd.includes('admin') || cmd.includes('analytics') || cmd.includes('एडमिन') || cmd.includes('dashboard')) {
      const reply = lang === 'mr' ? 'सार्वजनिक आरोग्य डॅशबोर्ड उघडत आहे.' : 'Opening Public Health Executive Analytics Dashboard.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/admin'), 800);
    }
    // 14. VILLAGE KIOSK
    else if (cmd.includes('kiosk') || cmd.includes('किओस्क')) {
      const reply = lang === 'mr' ? 'ग्राम विकास किओस्क पोर्टल उघडत आहे.' : 'Opening Village Health Kiosk Portal.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/kiosk'), 800);
    }
    // 15. LOGIN GATEWAY / LOGOUT
    else if (cmd.includes('login') || cmd.includes('लॉगिन') || cmd.includes('logout')) {
      const reply = lang === 'mr' ? 'लॉगिन गेटवे कडे जात आहे.' : 'Returning to Login Gateway.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/login'), 800);
    }
    // 16. LANGUAGE SWITCHING
    else if (cmd.includes('marathi') || cmd.includes('मराठी')) {
      setLang('mr');
      const reply = 'भाषा यशस्वीपणे मराठी केली आहे.';
      setAssistantResponse(reply);
      speakText(reply);
    }
    else if (cmd.includes('english') || cmd.includes('इंग्रजी')) {
      setLang('en');
      const reply = 'Language switched to English.';
      setAssistantResponse(reply);
      speakText(reply);
    }
    // DEFAULT GENERIC ACTION WITH FEEDBACK
    else {
      const reply = `Executing CareLink action for command: "${commandText}"`;
      setAssistantResponse(reply);
      speakText(reply);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      zIndex: 999999,
      touchAction: 'none'
    }}>
      {/* Floating AI Voice Mic Trigger Button (Draggable) */}
      <div
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onClick={handleButtonClick}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isListening ? '#E11D48' : 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
          color: '#FFFFFF',
          border: '2px solid #FFFFFF',
          boxShadow: isListening ? '0 0 24px rgba(225, 29, 72, 0.8)' : '0 12px 30px rgba(13, 148, 136, 0.5)',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'box-shadow 0.2s ease, transform 0.1s ease',
          userSelect: 'none'
        }}
        title="Click to speak / Drag with cursor to move anywhere on screen"
      >
        {isListening ? <MicOff size={24} style={{ animation: 'pulse 1s infinite' }} /> : <Sparkles size={24} />}
      </div>

      {/* Voice Assistant Popover Panel */}
      {showWidget && (
        <div style={{
          position: 'absolute',
          top: pos.y > 350 ? '-310px' : '65px',
          left: pos.x > window.innerWidth - 380 ? '-280px' : '0px',
          background: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          width: '340px',
          boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
          border: '1px solid rgba(13, 148, 136, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Volume2 size={16} /> CareLink Voice AI Controller
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowWidget(false)} style={{ color: '#94A3B8', padding: '2px' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '12px', minHeight: '56px', marginBottom: '12px', fontSize: '0.8125rem' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
              {isListening ? '🎤 Listening (English / मराठी)...' : 'Speech Transcript'}
            </div>
            <div style={{ color: '#34D399', fontWeight: 700 }}>
              {transcript || (lang === 'mr' ? 'व्हॉइस कमांड बोला (उदा. "व्हिडिओ कॉल", "पेशंट पोर्टल")' : 'Speak a command or drag button anywhere')}
            </div>
          </div>

          {assistantResponse && (
            <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
              <CheckCircle2 size={14} color="#34D399" />
              <span>{assistantResponse}</span>
            </div>
          )}

          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px' }}>Direct Voice Shortcuts:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button className="btn btn-ghost btn-sm" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF', fontSize: '11px', fontWeight: 800 }} onClick={() => processVoiceCommand('generate prescription')}>
              📄 Generate Prescription
            </button>
            <button className="btn btn-ghost btn-sm" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', fontSize: '11px', fontWeight: 800 }} onClick={() => processVoiceCommand('download pdf')}>
              📥 Download PDF
            </button>
            <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '11px' }} onClick={() => processVoiceCommand('start video call')}>
              📹 Video Call
            </button>
            <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '11px' }} onClick={() => processVoiceCommand('open patient portal')}>
              👤 Patient Portal
            </button>
            <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '11px' }} onClick={() => processVoiceCommand('go to asha dashboard')}>
              🏥 ASHA Suite
            </button>
            <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '11px' }} onClick={() => processVoiceCommand('doctor dashboard')}>
              🩺 Doctor Suite
            </button>
            <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(13, 148, 136, 0.3)', color: '#38BDF8', fontSize: '11px' }} onClick={() => processVoiceCommand(lang === 'mr' ? 'english' : 'marathi')}>
              🌐 {lang === 'mr' ? 'Switch to EN' : 'मराठी करा'}
            </button>
          </div>
        </div>
      )}

      {/* Voice-Activated Real-Time e-Prescription Modal */}
      <EPrescriptionModal
        isOpen={showRxModal}
        onClose={() => setShowRxModal(false)}
        patient={{
          full_name: 'Sunita Jadhav',
          full_name_mr: 'सुनीता जाधव',
          age: 26,
          gender: 'Female',
          phone: '9342222160',
          abha_id: '91-8428-7052-5101'
        }}
        referral={{
          referred_by_name: 'Dr. S Saindhavi, MD (OB-GYN & Maternal-Fetal Specialist)',
          to_facility_name: 'District Hospital Satara',
          reason: 'O14.0 — Mild Pre-eclampsia evaluation & BP monitoring'
        }}
      />
    </div>
  );
}
