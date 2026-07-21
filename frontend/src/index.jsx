// Entry point: mounts the React app into the #root div from index.html
// (at the project root — Vite's convention, unlike CRA's public/index.html).
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // global styles + CSS variables (design tokens) used across the app
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode double-invokes some lifecycle/effect code in development only
  // (to help surface side-effect bugs) — it has no effect on the production build.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
