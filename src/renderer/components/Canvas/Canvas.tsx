// src/renderer/components/Canvas/Canvas.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { Card } from '../../../shared/types/card';
import { DraggableCard } from '../DraggableCard/DraggableCard';
import { Connection } from '../Connection/Connection';
import './Canvas.css';

export const Canvas: React.FC = () => {
  const editor = useEditor();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgeStartCard, setEdgeStartCard] = useState<number | null>(null);
  const [tempEdgeEnd, setTempEdgeEnd] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  // Add DOM event listeners for panning and zooming
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Check if the click is on interactive elements that should not trigger panning
      const target = e.target as HTMLElement;

      // Consider only card elements and toolbar buttons as interactive
      const isInteractiveElement =
        target.closest('.draggable-card') ||
        target.closest('.edge-connector-button') ||
        target.closest('.card-entry-point') ||
        target.closest('.card-exit-point') ||
        target.closest('.canvas-toolbar') ||
        // Для connection учитываем только клик по тексту или узлу, но не по SVG-контейнеру
        target.closest('.connection-label');

      if (!isInteractiveElement) {
        console.log("Panning started", target);
        setIsPanning(true);
        setLastMousePosition({ x: e.clientX, y: e.clientY });
        canvas.style.cursor = 'grabbing';
      } else {
        console.log("Click on interactive element, not starting panning", target);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;

      const dx = e.clientX - lastMousePosition.x;
      const dy = e.clientY - lastMousePosition.y;

      setLastMousePosition({ x: e.clientX, y: e.clientY });
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    };

    const handleMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        canvas.style.cursor = 'grab';
        console.log("Panning ended");
      }
    };

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, lastMousePosition]);

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = (rect.width / 2 - panOffset.x) / scale;
    const centerY = (rect.height / 2 - panOffset.y) / scale;

    editor.addCard({
      position: { x: centerX, y: centerY }
    });
  };

  // Reset view to initial state
  const handleResetView = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Render connections
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
        <button onClick={handleResetView}>Reset View</button>
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
        className="canvas"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
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

// Temporary connection component
const TempConnection: React.FC<{
  sourceCard: Card;
  endPosition: { x: number; y: number };
}> = ({ sourceCard, endPosition }) => {
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
