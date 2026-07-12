// Entry point: mounts the React app into the #root div from public/index.html.
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // global styles + CSS variables (design tokens) used across the app
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode double-invokes some lifecycle/effect code in development only
  // (to help surface side-effect bugs) — it has no effect on the production build.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
