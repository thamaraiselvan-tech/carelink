import { Activity } from 'lucide-react';

export default function Loader({ text = 'CareLink AI Engine Loading...' }) {
  return (
    <div className="loader-container">
      <div className="loader-3d-ring">
        <div className="ring-pulse" />
        <Activity size={32} className="loader-icon" />
      </div>
      <div className="loader-text">{text}</div>
    </div>
  );
}
