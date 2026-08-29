import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Guarantee startup splash loader is visible for at least 1.2s to display the heartbeat pulse animation
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('app-splash');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.visibility = 'hidden';
      setTimeout(() => {
        splash.remove();
      }, 500);
    }
  }, 1200);
});

// Fallback in case load event already fired
setTimeout(() => {
  const splash = document.getElementById('app-splash');
  if (splash) {
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';
    setTimeout(() => splash.remove(), 500);
  }
}, 1600);
