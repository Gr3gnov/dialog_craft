// src/renderer/layouts/MainLayout.tsx
import React from 'react';
import { Workspace } from '../components/Workspace';
import { PropertyPanel } from '../components/PropertyPanel';
import { CytoscapeService } from '../../services/CytoscapeService';
import { GraphService } from '../../services/GraphService';
import { EditorProvider } from '../contexts/EditorContext';
import './MainLayout.css';

// Создаем экземпляры сервисов
const graphService = new GraphService();
const cytoscapeService = new CytoscapeService();

// Добавляем несколько тестовых карточек и связей
const initializeTestData = () => {
  // Добавляем карточки
  graphService.addCard({
    id: 1,
    title: 'Начало диалога',
    text: 'Привет, путник! Куда держишь путь?',
    character_name: 'Старейшина',
    position: { x: 100, y: 100 },
    is_narrator: true
  });

  graphService.addCard({
    id: 2,
    title: 'Ответ 1',
    text: 'Я иду в соседнюю деревню.',
    position: { x: 100, y: 250 }
  });

  graphService.addCard({
    id: 3,
    title: 'Ответ 2',
    text: 'Не твое дело, старик.',
    position: { x: 300, y: 250 },
    is_thought: true
  });

  graphService.addCard({
    id: 4,
    title: 'Реакция на ответ 1',
    text: 'Будь осторожен, в лесу видели волков.',
    character_name: 'Старейшина',
    position: { x: 100, y: 400 }
  });

  graphService.addCard({
    id: 5,
    title: 'Реакция на ответ 2',
    text: 'Как грубо! Что ж, иди своей дорогой.',
    character_name: 'Старейшина',
    position: { x: 300, y: 400 }
  });

  // Добавляем связи
  graphService.addEdge(1, 2, { label: 'Вежливо', color: '#4CAF50' });
  graphService.addEdge(1, 3, { label: 'Грубо', color: '#F44336' });
  graphService.addEdge(2, 4, { label: 'Далее' });
  graphService.addEdge(3, 5, { label: 'Далее' });
};

// Инициализируем тестовые данные
initializeTestData();

export const MainLayout: React.FC = () => {
  return (
    <EditorProvider graphService={graphService}>
      <div className="main-layout">
        <header className="app-header">
          <h1>Dialog Craft</h1>
          <div className="header-actions">
            <button className="header-button">Новая сцена</button>
            <button className="header-button">Открыть</button>
            <button className="header-button">Сохранить</button>
            <button className="header-button">Экспорт в YAML</button>
          </div>
        </header>
        <main className="main-content">
          <Workspace cytoscapeService={cytoscapeService} />
          <PropertyPanel />
        </main>
      </div>
    </EditorProvider>
  );
};
