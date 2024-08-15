import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

// Replace this with your own DSN from Sentry
Sentry.init({
  dsn: 'https://your-public-dsn-key@o0.ingest.sentry.io/your-project-id',
  integrations: [
    new Integrations.BrowserTracing(),
  ],
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production to avoid overwhelming your system.
  tracesSampleRate: 1.0,
});



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
