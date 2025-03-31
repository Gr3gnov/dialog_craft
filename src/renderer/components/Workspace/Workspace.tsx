// src/renderer/components/Workspace/Workspace.tsx
import React, { useEffect, useRef, useState } from 'react';
import { CytoscapeService } from '../../../services/CytoscapeService';
import { useEditor } from '../../contexts/EditorContext';
import './Workspace.css';

interface WorkspaceProps {
  cytoscapeService: CytoscapeService;
}

export const Workspace: React.FC<WorkspaceProps> = ({ cytoscapeService }) => {
  const editor = useEditor();
  const cyContainerRef = useRef<HTMLDivElement>(null);
  const [isEdgeCreationMode, setIsEdgeCreationMode] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<number | null>(null);

  // Инициализация Cytoscape при монтировании компонента
  useEffect(() => {
    if (cyContainerRef.current) {
      cytoscapeService.initialize(cyContainerRef.current);

      // Передаем карточки и связи из текущей сцены в Cytoscape
      cytoscapeService.renderGraph(editor.scene.cards, editor.scene.edges);

      // Устанавливаем обработчики событий
      cytoscapeService.onNodeSelected((id) => {
        editor.setSelectedCard(id);
        editor.setSelectedEdge(null);
      });

      cytoscapeService.onEdgeSelected((id) => {
        editor.setSelectedEdge(id);
        editor.setSelectedCard(null);
      });

      cytoscapeService.onNodeMoved((id, position) => {
        // Обновляем позицию карточки в редакторе
        editor.updateCard(id, { position });
      });
    }

    return () => {
      // Очистка при демонтировании компонента
      // (если необходимо)
    };
  }, [cytoscapeService]);

  // Обновляем граф при изменении сцены
  useEffect(() => {
    cytoscapeService.renderGraph(editor.scene.cards, editor.scene.edges);

    // Если есть выбранный элемент, выделяем его
    if (editor.selectedCardId !== null) {
      cytoscapeService.selectElement('node', editor.selectedCardId);
    } else if (editor.selectedEdgeId !== null) {
      cytoscapeService.selectElement('edge', editor.selectedEdgeId);
    }
  }, [editor.scene, editor.selectedCardId, editor.selectedEdgeId]);

  // Обработчик начала создания связи
  const handleStartEdgeCreation = (sourceId: number) => {
    setIsEdgeCreationMode(true);
    setSourceNodeId(sourceId);
  };

  // Обработчик завершения создания связи
  const handleCompleteEdgeCreation = (targetId: number) => {
    if (sourceNodeId !== null && sourceNodeId !== targetId) {
      editor.addEdge(sourceNodeId, targetId);
    }
    setIsEdgeCreationMode(false);
    setSourceNodeId(null);
  };

  // Обработчик отмены создания связи
  const handleCancelEdgeCreation = () => {
    setIsEdgeCreationMode(false);
    setSourceNodeId(null);
  };

  // Обработчик добавления новой карточки
  const handleAddCard = () => {
    const newCard = editor.addCard({
      position: { x: 100, y: 100 } // Позиция по умолчанию
    });

    // Выбираем новую карточку
    editor.setSelectedCard(newCard.id);

    // Центрируем вид на новой карточке
    cytoscapeService.centerOn(newCard.id.toString());
  };

  // Обработчик автоматического размещения
  const handleAutoLayout = () => {
    cytoscapeService.applyLayout();
  };

  // Рендеринг компонента
  return (
    <div className="workspace-container">
      {/* Панель инструментов */}
      <div className="workspace-toolbar">
        <button
          onClick={handleAddCard}
          className="toolbar-button"
          title="Добавить карточку"
        >
          <span>+</span> Карточка
        </button>
        <button
          onClick={handleAutoLayout}
          className="toolbar-button"
          title="Автоматическое размещение"
        >
          <span>⟲</span> Расположить
        </button>
        {isEdgeCreationMode && (
          <div className="edge-creation-mode">
            <span>Режим создания связи: выберите целевую карточку</span>
            <button
              onClick={handleCancelEdgeCreation}
              className="toolbar-button"
              title="Отменить создание связи"
            >
              Отмена
            </button>
          </div>
        )}
      </div>

      {/* Рабочая область Cytoscape */}
      <div
        ref={cyContainerRef}
        className="cytoscape-container"
      ></div>

      {/* Дополнительные элементы (кнопки на карточках для создания связей) будут добавлены в CSS */}
    </div>
  );
};
