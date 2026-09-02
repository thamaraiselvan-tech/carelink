import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Immediately fade out splash screen when React mounts
setTimeout(() => {
  const splash = document.getElementById('app-splash');
  if (splash) {
    splash.classList.add('fade-out');
    setTimeout(() => {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 400);
  }
}, 400);
