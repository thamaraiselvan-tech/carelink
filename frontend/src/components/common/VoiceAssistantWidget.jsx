import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function VoiceAssistantWidget() {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [showWidget, setShowWidget] = useState(false);
  const [recognition, setRecognition] = useState(null);

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
      setAssistantResponse('Speech recognition not supported in this browser, using quick voice command buttons.');
      setShowWidget(true);
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

    if (cmd.includes('patient') || cmd.includes('पेशंट') || cmd.includes('portal')) {
      const reply = 'Opening CareLink AI Patient OPD Portal now.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/patient'), 1000);
    } else if (cmd.includes('video') || cmd.includes('call') || cmd.includes('कॉल') || cmd.includes('teleconsultation')) {
      const reply = 'Launching eSanjeevani Live Video Consultation Room.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/teleconsultation'), 1000);
    } else if (cmd.includes('asha') || cmd.includes('dashboard') || cmd.includes('आशा')) {
      const reply = 'Navigating to ASHA Care Coordinator Suite.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/asha'), 1000);
    } else if (cmd.includes('doctor') || cmd.includes('डॉक्टर')) {
      const reply = 'Navigating to Doctor Specialist Worklist.';
      setAssistantResponse(reply);
      speakText(reply);
      setTimeout(() => navigate('/doctor'), 1000);
    } else {
      const reply = `Received command: "${commandText}". Processing automated workflow.`;
      setAssistantResponse(reply);
      speakText(reply);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 99999 }}>
      {/* Floating AI Voice Mic Trigger Button */}
      <button
        onClick={toggleListening}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isListening ? '#E11D48' : 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
          color: '#FFFFFF',
          border: '2px solid #FFFFFF',
          boxShadow: isListening ? '0 0 24px rgba(225, 29, 72, 0.8)' : '0 12px 30px rgba(13, 148, 136, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        title="Click to speak a voice command to CareLink AI Voice Assistant"
      >
        {isListening ? <MicOff size={24} style={{ animation: 'pulse 1s infinite' }} /> : <Sparkles size={24} />}
      </button>

      {/* Voice Assistant Popover Panel */}
      {showWidget && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          left: 0,
          background: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          width: '320px',
          boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
          border: '1px solid rgba(13, 148, 136, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Volume2 size={16} /> CareLink Voice AI Assistant
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowWidget(false)} style={{ color: '#94A3B8', padding: '2px' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '12px', minHeight: '60px', marginBottom: '14px', fontSize: '0.8125rem' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
              {isListening ? '🎤 Listening...' : 'Speech Transcript'}
            </div>
            <div style={{ color: '#34D399', fontWeight: 700 }}>
              {transcript || 'Speak a command (e.g. "Start video call", "Open patient portal")'}
            </div>
          </div>

          {assistantResponse && (
            <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#34D399" />
              <span>{assistantResponse}</span>
            </div>
          )}

          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px' }}>Or click a voice quick action:</div>
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
          </div>
        </div>
      )}
    </div>
  );
}
