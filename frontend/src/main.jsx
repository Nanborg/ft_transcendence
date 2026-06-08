import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';
import './styles.css';

// Find the HTML element where React render app
const rootElement = document.getElementById('root');

// Start React / render the App
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);