import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Guarantee startup splash loader is visible for 3.5s with a smooth scale & fade transform transition
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('app-splash');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.remove();
      }, 850);
    }
  }, 3500);
});

// Fallback in case load event already fired
setTimeout(() => {
  const splash = document.getElementById('app-splash');
  if (splash && !splash.classList.contains('fade-out')) {
    splash.classList.add('fade-out');
    setTimeout(() => splash.remove(), 850);
  }
}, 4200);
