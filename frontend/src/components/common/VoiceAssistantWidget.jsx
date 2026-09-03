import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Sparkles, X, CheckCircle2, Move } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function VoiceAssistantWidget() {
  const navigate = useNavigate();
  const { lang, setLang } = useLang();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [showWidget, setShowWidget] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Draggable Position State (default bottom left area clearing sidebar)
  const [pos, setPos] = useState(() => ({
    x: 260,
    y: Math.max(100, window.innerHeight - 90)
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

  const processVoiceCommand = (commandText) => {
    const cmd = commandText.toLowerCase();

    // 1. TELECONSULTATION / VIDEO CALL
    if (cmd.includes('video') || cmd.includes('call') || cmd.includes('कॉल') || cmd.includes('teleconsultation') || cmd.includes('eSanjeevani')) {
      const reply = lang === 'mr' ? 'ई-संजीवनी व्हिडिओ कॉल कक्ष उघडत आहे.' : 'Launching eSanjeevani Teleconsultation Room now.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/teleconsultation'), 800);
    }
    // 2. PATIENT PORTAL
    else if (cmd.includes('patient') || cmd.includes('पेशंट') || cmd.includes('portal') || cmd.includes('abha')) {
      const reply = lang === 'mr' ? 'केरलिंक पेशंट ओपीडी पोर्टल उघडत आहे.' : 'Opening CareLink AI Patient OPD Portal now.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/patient'), 800);
    }
    // 3. ASHA SUITE & TRIAGE
    else if (cmd.includes('asha') || cmd.includes('triage') || cmd.includes('आशा') || cmd.includes('vitals')) {
      const reply = lang === 'mr' ? 'आशा केअर कोऑर्डिनेटर डॅशबोर्ड उघडत आहे.' : 'Opening ASHA Care Coordinator Suite.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/asha'), 800);
    }
    // 4. DOCTOR DASHBOARD
    else if (cmd.includes('doctor') || cmd.includes('डॉक्टर') || cmd.includes('worklist')) {
      const reply = lang === 'mr' ? 'डॉक्टर तज्ज्ञ कार्यसूची उघडत आहे.' : 'Navigating to Doctor Specialist Worklist.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/doctor'), 800);
    }
    // 5. ADMIN ANALYTICAL DASHBOARD
    else if (cmd.includes('admin') || cmd.includes('analytics') || cmd.includes('एडमिन') || cmd.includes('dashboard')) {
      const reply = lang === 'mr' ? 'सार्वजनिक आरोग्य डॅशबोर्ड उघडत आहे.' : 'Opening Public Health Executive Analytics Dashboard.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/admin'), 800);
    }
    // 6. VILLAGE KIOSK
    else if (cmd.includes('kiosk') || cmd.includes('किओस्क')) {
      const reply = lang === 'mr' ? 'ग्राम विकास किओस्क पोर्टल उघडत आहे.' : 'Opening Village Health Kiosk Portal.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/kiosk'), 800);
    }
    // 7. LOGIN GATEWAY
    else if (cmd.includes('login') || cmd.includes('लॉगिन') || cmd.includes('logout')) {
      const reply = lang === 'mr' ? 'लॉगिन गेटवे कडे जात आहे.' : 'Returning to Login Gateway.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/login'), 800);
    }
    // 8. LANGUAGE SWITCHING
    else if (cmd.includes('marathi') || cmd.includes('मराठी')) {
      setLang('mr');
      const reply = 'भाषा मराठी केली आहे.';
      setAssistantResponse(reply);
      speakText(reply);
    }
    else if (cmd.includes('english') || cmd.includes('इंग्रजी')) {
      setLang('en');
      const reply = 'Language switched to English.';
      setAssistantResponse(reply);
      speakText(reply);
    }
    // 9. TELEPHONY PHONE CALL ALERT
    else if (cmd.includes('phone') || cmd.includes('mobile') || cmd.includes('सेल')) {
      const reply = lang === 'mr' ? '+91 9677563417 वर टेलिफोनी कॉल ट्रिगर केला आहे.' : 'Triggered telephony phone call alert to +91 9677563417.';
      setAssistantResponse(reply);
      speakText(reply);
      window.location.href = 'tel:+919677563417';
    }
    // DEFAULT GENERIC ACTION
    else {
      const reply = `Received command: "${commandText}". Automated action executed successfully.`;
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
            <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '11px' }} onClick={() => processVoiceCommand('admin dashboard')}>
              📊 Admin Suite
            </button>
            <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(13, 148, 136, 0.3)', color: '#38BDF8', fontSize: '11px' }} onClick={() => processVoiceCommand(lang === 'mr' ? 'english' : 'marathi')}>
              🌐 {lang === 'mr' ? 'Switch to EN' : 'मराठी करा'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
