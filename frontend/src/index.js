import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App/App.js';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.js';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
