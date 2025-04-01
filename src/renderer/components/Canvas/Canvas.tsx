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

  // Add DOM event listeners for panning and zooming
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isPanning = false;
    let lastPosition = { x: 0, y: 0 };

    // Mouse down handler for panning
    const handleMouseDown = (e: MouseEvent) => {
      // Only start panning if clicking on the canvas or grid, not on cards/connections
      if (e.target === canvas || (e.target as HTMLElement).classList.contains('canvas-grid')) {
        isPanning = true;
        lastPosition = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    // Mouse move handler for panning
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - lastPosition.x;
        const dy = e.clientY - lastPosition.y;

        setPanOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));

        lastPosition = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }

      // Edge creation logic
      if (isCreatingEdge) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - panOffset.x) / scale;
        const y = (e.clientY - rect.top - panOffset.y) / scale;
        setTempEdgeEnd({ x, y });
      }
    };

    // Mouse up handler to stop panning
    const handleMouseUp = () => {
      if (isPanning) {
        isPanning = false;
        canvas.style.cursor = 'grab';
      }
    };

    // Mouse leave handler to stop panning if cursor leaves canvas
    const handleMouseLeave = () => {
      if (isPanning) {
        isPanning = false;
        canvas.style.cursor = 'grab';
      }
    };

    // Wheel handler for zooming
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate point on canvas under the mouse in scaled coordinates
      const pointX = (mouseX - panOffset.x) / scale;
      const pointY = (mouseY - panOffset.y) / scale;

      // Calculate new scale
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      const newScale = Math.min(Math.max(scale + delta, 0.1), 3);

      // Calculate new offsets to zoom around mouse position
      const newOffsetX = mouseX - pointX * newScale;
      const newOffsetY = mouseY - pointY * newScale;

      setScale(newScale);
      setPanOffset({ x: newOffsetX, y: newOffsetY });
    };

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Clean up event listeners on unmount
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [scale, panOffset, isCreatingEdge, edgeStartCard]);

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
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`
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
