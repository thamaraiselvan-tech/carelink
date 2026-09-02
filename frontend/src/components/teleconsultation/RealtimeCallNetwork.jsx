import { useState, useEffect } from 'react';
import { Wifi, PhoneCall, ShieldCheck, Activity, Smartphone, Radio, Zap } from 'lucide-react';
import { CareLinkPeerEngine } from '../../services/webrtcEngine';

export default function RealtimeCallNetwork({ phone = '8428705251' }) {
  const [stats, setStats] = useState({
    rttMs: 32,
    bitrateKbps: 64,
    packetLossPercent: 0.1,
    resolution: '1080p @ 30fps',
    protocol: 'WebRTC Direct P2P (SRTP Encrypted)',
    status: 'CONNECTED_STABLE'
  });
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);

  useEffect(() => {
    const engine = new CareLinkPeerEngine();
    const interval = setInterval(() => {
      setStats(engine.getNetworkStats());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formattedPhone = phone.includes('+91') ? phone : `+91 ${phone}`;

  return (
    <div style={{ position: 'relative' }}>
      {/* Network Status Badge Bar */}
      <div
        onClick={() => setShowNetworkDetails(!showNetworkDetails)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          color: '#34D399',
          padding: '6px 12px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 800,
          cursor: 'pointer',
          userSelect: 'none'
        }}
        title="Click to view real-time WebRTC network latency & bitrate metrics"
      >
        <Wifi size={14} style={{ animation: 'pulse 1.5s infinite' }} />
        <span>P2P Call Network ({stats.rttMs} ms · {stats.bitrateKbps} kbps)</span>
        <Zap size={12} color="#F59E0B" />
      </div>

      {/* Real-time Network Metrics HUD Overlay */}
      {showNetworkDetails && (
        <div style={{
          position: 'absolute',
          top: '38px',
          right: 0,
          background: '#0F172A',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '14px',
          padding: '16px',
          width: '280px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
          zIndex: 9999,
          color: '#FFFFFF'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} /> WebRTC Media Stream Stats
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8125rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>RTT LATENCY</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#34D399' }}>{stats.rttMs} ms</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>AUDIO BITRATE</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#38BDF8' }}>{stats.bitrateKbps} kbps</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>PACKET LOSS</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#F43F5E' }}>{stats.packetLossPercent}%</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>VIDEO RES</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#F8FAFC' }}>1080p HD</div>
            </div>
          </div>

          <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>Topology: {stats.protocol}</span>
          </div>
        </div>
      )}
    </div>
  );
}
