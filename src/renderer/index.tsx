// src/renderer/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

console.log('Renderer process starting...');

const container = document.getElementById('root');
if (!container) {
  console.error('Failed to find the root element');
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App rendered');
