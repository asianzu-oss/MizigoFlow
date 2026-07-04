import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('Back online — syncing pending data...');
  import('./utils/offline').then(({ syncPendingData }) => {
    import('./services/api').then(({ default: api }) => {
      syncPendingData(api);
    });
  });
});

window.addEventListener('offline', () => {
  console.log('Gone offline — switching to offline mode');
});
