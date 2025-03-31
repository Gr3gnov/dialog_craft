// src/renderer/App.tsx - упрощенная версия
import React from 'react';
import { GraphService } from '../services/GraphService';
import './App.css';

const graphService = new GraphService();

// Добавляем тестовую карточку
graphService.addCard({
  id: 1,
  title: 'Тестовая карточка',
  text: 'Привет, мир!',
  position: { x: 100, y: 100 }
});

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
          <p>Добавлена тестовая карточка с ID: 1</p>
        </div>
      </main>
    </div>
  );
};

export default App;
