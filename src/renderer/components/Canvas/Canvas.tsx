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
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgeStartCard, setEdgeStartCard] = useState<number | null>(null);
  const [tempEdgeEnd, setTempEdgeEnd] = useState({ x: 0, y: 0 });

  // Обработка начала перемещения холста
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Убедимся, что это клик на самом холсте, а не на карточке или другом интерактивном элементе
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-grid')) {
      setIsPanning(true);
      setStartPanPosition({ x: e.clientX, y: e.clientY });
      e.preventDefault();

      // Установка стиля курсора через DOM для гарантированного обновления
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    }
  };

  // Обработка перемещения холста при движении мыши
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - startPanPosition.x;
      const deltaY = e.clientY - startPanPosition.y;

      setCanvasOffset({
        x: canvasOffset.x + deltaX,
        y: canvasOffset.y + deltaY
      });

      setStartPanPosition({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }

    // Код для обработки создания соединения
    if (isCreatingEdge) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        // Преобразуем координаты курсора в координаты холста
        const x = (e.clientX - canvasRect.left - canvasOffset.x) / scale;
        const y = (e.clientY - canvasRect.top - canvasOffset.y) / scale;
        setTempEdgeEnd({ x, y });
      }
    }
  };

  // Обработка окончания перемещения холста
  const handleCanvasMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);

      // Сброс стиля курсора
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    }
  };

  // Обработка выхода курсора мыши за пределы холста
  const handleMouseLeave = () => {
    if (isPanning) {
      setIsPanning(false);

      // Сброс стиля курсора
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    }
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Obtain cursor position relative to the viewport
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Calculate cursor position relative to the scaled and translated canvas
    const pointX = (mouseX - canvasOffset.x) / scale;
    const pointY = (mouseY - canvasOffset.y) / scale;

    // Calculate new scale
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newScale = Math.min(Math.max(scale + delta, 0.1), 3);

    // Calculate new offset to zoom around cursor position
    const newOffsetX = mouseX - pointX * newScale;
    const newOffsetY = mouseY - pointY * newScale;

    setScale(newScale);
    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
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
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const centerX = (canvasRect.width / 2 - canvasOffset.x) / scale;
    const centerY = (canvasRect.height / 2 - canvasOffset.y) / scale;

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
        <button onClick={() => {
          setScale(1);
          setCanvasOffset({ x: 0, y: 0 });
        }}>Reset View</button>
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
        className={`canvas ${isPanning ? 'dragging' : ''}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`
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
