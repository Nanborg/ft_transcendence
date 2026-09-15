// WHY: Frontend entrypoint mounts React and global styles once
// DECISION: App owns all routing and providers after this single React root
// REQUIRED: Bootstrap loads before app styles so local CSS can override defaults
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const rootElement = document.getElementById('root');

createRoot(rootElement).render(<App />);
