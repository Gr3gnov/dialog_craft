import React, { useEffect, useRef } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import styles from './Workspace.module.css';

const Workspace: React.FC = () => {
  const { 
    scene, 
    createCard, 
    setSelectedCardId, 
    selectedCardId 
  } = useEditor();
  
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Обработчик нажатия на кнопку "Добавить карточку"
  const handleAddCard = () => {
    // Вычисляем позицию для новой карточки
    const position = { x: 100, y: 100 };
    
    // Создаем новую карточку
    const newCard = createCard({
      title: 'Новая реплика',
      text: 'Текст реплики',
      position,
      is_narrator: false,
      is_thought: false
    });
    
    // Выбираем созданную карточку
    setSelectedCardId(newCard.id);
  };

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.toolbar}>
        <button className={styles.addButton} onClick={handleAddCard}>
          + Добавить карточку
        </button>
      </div>
      
      <div className={styles.workspace} ref={workspaceRef}>
        {/* Здесь будет визуализация с использованием Cytoscape.js */}
        <div className={styles.placeholder}>
          <p>Рабочая область</p>
          <p>Карточек: {scene.cards.length}</p>
          <p>Связей: {scene.edges.length}</p>
          {selectedCardId && <p>Выбрана карточка: {selectedCardId}</p>}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
