// src/renderer/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Добавим отладочную информацию
console.log('Renderer script loaded');
console.log('Searching for root element...');

const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React app rendered');
} else {
  console.error('Root element not found!');
  // Создадим элемент root, если он не существует
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  console.log('Created new root element');

  const root = ReactDOM.createRoot(newRoot);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React app rendered to dynamically created root');
}
