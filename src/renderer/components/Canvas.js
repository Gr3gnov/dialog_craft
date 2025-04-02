// src/renderer/components/Canvas.js
import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import './Canvas.css';

const Canvas = ({ cards, onCardSelect, selectedCardId, onUpdateCard }) => {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Zoom state
  const [scale, setScale] = useState(1);
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 3;
  const ZOOM_SENSITIVITY = 0.0005;

  // Handle canvas click (deselect)
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      onCardSelect(null);
    }
  };

  // Handle mouse move for card dragging or canvas panning
  const handleMouseMove = (e) => {
    if (dragging) {
      // Card dragging - add logging
      console.log('Dragging card', dragging);
      console.log('Mouse position:', { x: e.clientX, y: e.clientY });
      console.log('Drag offset:', dragOffset);

      // Calculate position relative to the canvas scale and offset
      const newPosition = {
        x: (e.clientX - dragOffset.x) / scale - canvasOffset.x / scale,
        y: (e.clientY - dragOffset.y) / scale - canvasOffset.y / scale
      };

      console.log('New calculated position:', newPosition);

      // Update the card position
      const updatedCard = cards.find(card => card.id === dragging);
      if (updatedCard) {
        console.log('Previous card position:', updatedCard.position);
        onUpdateCard({
          ...updatedCard,
          position: newPosition
        });
      }
    } else if (isPanning) {
      // Canvas panning
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;

      setCanvasOffset({
        x: canvasOffset.x + dx,
        y: canvasOffset.y + dy
      });

      setPanStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  // Handle mouse up to end dragging or panning
  const handleMouseUp = () => {
    if (dragging) {
      console.log('End dragging card', dragging);
      setDragging(null);
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Handle mouse down for panning
  const handleMouseDown = (e) => {
    // Middle mouse button (wheel) or space + left click
    if (e.button === 1 || (spacePressed && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  // Handle wheel event for zooming
  const handleWheel = (e) => {
    e.preventDefault();

    // Get mouse position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate zoom factor
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (1 + delta)));

    // Calculate new offset to zoom toward mouse position
    const scaleRatio = newScale / scale;
    const newOffsetX = mouseX - (mouseX - canvasOffset.x) * scaleRatio;
    const newOffsetY = mouseY - (mouseY - canvasOffset.y) * scaleRatio;

    setScale(newScale);
    setCanvasOffset({
      x: newOffsetX,
      y: newOffsetY
    });
  };

  // Handle keyboard events for space bar
  const handleKeyDown = (e) => {
    if (e.code === 'Space' && !spacePressed) {
      setSpacePressed(true);
      // Change cursor to indicate panning is available
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === 'Space') {
      setSpacePressed(false);
      // Restore cursor
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'default';
      }
    }
  };

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      if (canvasElement) {
        canvasElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [dragging, dragOffset, cards, isPanning, panStart, canvasOffset, spacePressed, scale]);

  // Handle the start of card dragging
  const handleCardDragStart = (id, offsetX, offsetY) => {
    if (!isPanning && !spacePressed) {
      console.log('Start dragging card', id);
      console.log('Original offset:', { offsetX, offsetY });

      // Use correct offset considering scale
      const scaledOffsetX = offsetX * scale;
      const scaledOffsetY = offsetY * scale;

      console.log('Scaled offset:', {
        scaledOffsetX,
        scaledOffsetY
      });

      setDragging(id);
      setDragOffset({
        x: scaledOffsetX,
        y: scaledOffsetY
      });
    }
  };

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      style={{ cursor: spacePressed ? 'grab' : 'default' }}
    >
      <div
        className="canvas-content"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onSelect={onCardSelect}
            isSelected={card.id === selectedCardId}
            onDragStart={handleCardDragStart}
            onDragEnd={handleMouseUp}
            position={card.position}
            scale={scale}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="zoom-indicator">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default Canvas;
