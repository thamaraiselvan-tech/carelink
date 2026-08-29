import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Smoothly transition and remove static HTML splash loader
window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('app-splash');
  if (splash) {
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';
    setTimeout(() => {
      splash.remove();
    }, 450);
  }
});

// Fallback removal if DOMContentLoaded fired earlier
setTimeout(() => {
  const splash = document.getElementById('app-splash');
  if (splash) {
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';
    setTimeout(() => splash.remove(), 450);
  }
}, 300);
