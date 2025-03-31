// src/renderer/App.tsx
import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Dialog Craft</h1>
      </header>
      <main className="app-content">
        <div className="message-box">
          <h2>Тестовый запуск</h2>
          <p>Приложение успешно запущено!</p>
        </div>
      </main>
    </div>
  );
};

export default App;
