// src/renderer/components/Canvas/Canvas.tsx
import React, { useRef, useState, MouseEvent } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { Card } from '../../../shared/types/card';
import { DraggableCard } from '../DraggableCard/DraggableCard';
import { Connection } from '../Connection/Connection';
import './Canvas.css';

export const Canvas: React.FC = () => {
  const editor = useEditor();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgeStartCard, setEdgeStartCard] = useState<number | null>(null);
  const [tempEdgeEnd, setTempEdgeEnd] = useState({ x: 0, y: 0 });

  // Handle canvas pan (drag)
  const handleMouseDown = (e: MouseEvent) => {
    // Проверяем, что клик был на холсте, а не на карточке или другом элементе
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-grid')) {
      setIsDraggingCanvas(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      e.preventDefault(); // Предотвращаем выделение текста и другие действия
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingCanvas) {
      // Вычисляем дельту перемещения
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;

      // Обновляем позицию
      setOffset({
        x: offset.x + dx / scale,
        y: offset.y + dy / scale
      });

      // Обновляем стартовую позицию для следующего движения
      setStartPos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }

    // Остальной код для временного соединения
    if (isCreatingEdge) {
      setTempEdgeEnd({ x: (e.clientX - offset.x * scale) / scale, y: (e.clientY - offset.y * scale) / scale });
    }
  };
  const handleMouseUp = () => {
    if (isDraggingCanvas) {
      setIsDraggingCanvas(false);
    }
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Получаем позицию курсора относительно canvas
    const mouseX = (e.clientX - canvasRect.left) / scale;
    const mouseY = (e.clientY - canvasRect.top) / scale;

    // Вычисляем новый масштаб
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newScale = Math.min(Math.max(scale + delta, 0.1), 3);

    // Обновляем смещение, чтобы сохранить позицию под курсором
    const newOffsetX = offset.x - (mouseX * (newScale - scale));
    const newOffsetY = offset.y - (mouseY * (newScale - scale));

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };
  // Start edge creation
  const handleStartEdge = (cardId: number) => {
    setIsCreatingEdge(true);
    setEdgeStartCard(cardId);
  };

  // Complete edge creation
  const handleCardHoverForEdge = (cardId: number) => {
    if (isCreatingEdge && edgeStartCard !== null && edgeStartCard !== cardId) {
      editor.addEdge(edgeStartCard, cardId);
      setIsCreatingEdge(false);
      setEdgeStartCard(null);
    }
  };

  // Add a new card
  const handleAddCard = () => {
    // Calculate center of visible canvas
    const centerX = -offset.x / scale + window.innerWidth / 2 / scale;
    const centerY = -offset.y / scale + window.innerHeight / 2 / scale;

    editor.addCard({
      position: { x: centerX, y: centerY }
    });
  };

  // Render connections between cards
  const renderConnections = () => {
    return editor.scene.edges.map(edge => {
      const sourceCard = editor.scene.cards.find(c => c.id === edge.source);
      const targetCard = editor.scene.cards.find(c => c.id === edge.target);

      if (!sourceCard || !targetCard) return null;

      return (
        <Connection
          key={edge.id}
          sourcePosition={sourceCard.position}
          targetPosition={targetCard.position}
          label={edge.label}
          color={edge.color || '#607D8B'}
          selected={editor.selectedEdgeId === edge.id}
          onClick={() => editor.setSelectedEdge(edge.id)}
        />
      );
    });
  };

  return (
    <div className="canvas-container">
      <div className="canvas-toolbar">
        <button onClick={handleAddCard}>+ Add Card</button>
        <button onClick={() => setScale(1)}>Reset Zoom</button>
        {isCreatingEdge && (
          <>
            <span>Creating edge... Click on target card</span>
            <button onClick={() => {
              setIsCreatingEdge(false);
              setEdgeStartCard(null);
            }}>Cancel</button>
          </>
        )}
      </div>

      <div
  ref={canvasRef}
  className={`canvas ${isDraggingCanvas ? 'dragging' : ''}`}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp} /* Добавляем обработку выхода курсора */
  onWheel={handleWheel}
  style={{
    transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`
  }}
>
        {/* Grid background */}
        <div className="canvas-grid"></div>

        {/* Render cards */}
        {editor.scene.cards.map(card => (
          <DraggableCard
            key={card.id}
            card={card}
            selected={editor.selectedCardId === card.id}
            onSelect={() => editor.setSelectedCard(card.id)}
            onStartEdge={handleStartEdge}
            onHoverForEdge={handleCardHoverForEdge}
            onPositionChange={(position) => {
              editor.updateCard(card.id, { position });
            }}
          />
        ))}

        {/* Render connections */}
        {renderConnections()}

        {/* Render temp connection during edge creation */}
        {isCreatingEdge && edgeStartCard !== null && (
          <TempConnection
            sourceCard={editor.scene.cards.find(c => c.id === edgeStartCard)!}
            endPosition={tempEdgeEnd}
          />
        )}
      </div>
    </div>
  );
};

// Temporary connection component for edge creation
const TempConnection: React.FC<{
  sourceCard: Card;
  endPosition: { x: number; y: number };
}> = ({ sourceCard, endPosition }) => {
  // Implementation of temporary connection line
  return (
    <svg className="temp-connection">
      <line
        x1={sourceCard.position.x}
        y1={sourceCard.position.y}
        x2={endPosition.x}
        y2={endPosition.y}
        stroke="#666"
        strokeWidth={2}
        strokeDasharray="5,5"
      />
    </svg>
  );
};
