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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgeStartCard, setEdgeStartCard] = useState<number | null>(null);
  const [tempEdgeEnd, setTempEdgeEnd] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  // Center cards whenever they change
  useEffect(() => {
    if (editor.scene.cards.length === 0) return;
    centerCards();
  }, []);

  // Center all cards in view
  const centerCards = () => {
    const container = containerRef.current;
    if (!container || editor.scene.cards.length === 0) return;

    // Calculate bounds of all cards
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    editor.scene.cards.forEach(card => {
      minX = Math.min(minX, card.position.x);
      minY = Math.min(minY, card.position.y);
      maxX = Math.max(maxX, card.position.x + 300); // Add card width
      maxY = Math.max(maxY, card.position.y + 80);  // Add card height
    });

    // Calculate center of cards
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate container center
    const rect = container.getBoundingClientRect();
    const containerCenterX = rect.width / 2;
    const containerCenterY = rect.height / 2;

    // Set pan offset to center the cards
    setPanOffset({
      x: containerCenterX - centerX,
      y: containerCenterY - centerY
    });

    // Reset scale to 1
    setScale(1);
  };

  // Add DOM event listeners for panning and zooming
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Check if the click is on interactive elements that should not trigger panning
      const target = e.target as HTMLElement;

      // Consider only specific interactive elements
      const isInteractiveElement =
        target.closest('.draggable-card') ||
        target.closest('.edge-connector-button') ||
        target.closest('.card-entry-point') ||
        target.closest('.card-exit-point') ||
        target.closest('.canvas-toolbar') ||
        target.closest('.connection-label');

      if (!isInteractiveElement) {
        setIsPanning(true);
        setLastMousePosition({ x: e.clientX, y: e.clientY });
        canvas.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Update temp edge endpoint if creating an edge
      if (isCreatingEdge) {
        // Convert client coordinates to canvas coordinates
        const rect = container.getBoundingClientRect();
        const canvasX = (e.clientX - rect.left - panOffset.x) / scale;
        const canvasY = (e.clientY - rect.top - panOffset.y) / scale;
        setTempEdgeEnd({ x: canvasX, y: canvasY });
      }

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
      }
    };

    // Wheel event for zooming
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Get mouse position relative to canvas center
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom
      const zoomDirection = e.deltaY < 0 ? 1 : -1;
      const zoomFactor = 0.1; // Adjust zoom speed

      // Prevent zooming out too far - min scale 0.3
      const newScale = Math.max(0.3, Math.min(3, scale + zoomDirection * zoomFactor));

      if (newScale === scale) return; // No change needed

      // Calculate new pan offset to zoom toward mouse position
      const scaleChange = newScale / scale;

      // Adjust the pan offset so that the point under the mouse stays fixed
      setPanOffset({
        x: mouseX - (mouseX - panOffset.x) * scaleChange,
        y: mouseY - (mouseY - panOffset.y) * scaleChange
      });

      setScale(newScale);
    };

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isPanning, lastMousePosition, scale, panOffset, isCreatingEdge]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number): { x: number, y: number } => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };

    return {
      x: (screenX - panOffset.x) / scale,
      y: (screenY - panOffset.y) / scale
    };
  };

  // Start edge creation
  const handleStartEdge = (cardId: number) => {
    setIsCreatingEdge(true);
    setEdgeStartCard(cardId);

    // Find source card and initialize temp edge end position
    const sourceCard = editor.scene.cards.find(c => c.id === cardId);
    if (sourceCard) {
      setTempEdgeEnd({ ...sourceCard.position });
    }
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
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // Get center of the viewport
    const viewportCenterX = rect.width / 2;
    const viewportCenterY = rect.height / 2;

    // Convert to canvas coordinates
    const canvasPos = screenToCanvas(viewportCenterX, viewportCenterY);

    // Add the card at the center of the current view
    editor.addCard({
      position: canvasPos
    });
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
    <div
      ref={containerRef}
      className="canvas-container"
    >
      <div className="canvas-toolbar">
        <button onClick={handleAddCard}>+ Add Card</button>
        <button onClick={centerCards}>Center View</button>
        <span>Zoom: {Math.round(scale * 100)}%</span>
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
