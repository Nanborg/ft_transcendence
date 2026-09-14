import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const rootElement = document.getElementById('root');

createRoot(rootElement).render(<App />);
