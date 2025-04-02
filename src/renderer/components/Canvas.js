// src/renderer/components/Canvas.js
import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import './Canvas.css';

const Canvas = ({ cards, onCardSelect, selectedCardId, onUpdateCard }) => {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle canvas click (deselect)
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      onCardSelect(null);
    }
  };

  // Handle mouse move for card dragging
  const handleMouseMove = (e) => {
    if (dragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };

      // Update the card position
      const updatedCard = cards.find(card => card.id === dragging);
      if (updatedCard) {
        onUpdateCard({
          ...updatedCard,
          position: newPosition
        });
      }
    }
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (dragging) {
      setDragging(null);
    }
  };

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, cards]);

  // Handle the start of card dragging
  const handleCardDragStart = (id, offsetX, offsetY) => {
    setDragging(id);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onClick={handleCanvasClick}
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
        />
      ))}
    </div>
  );
};

export default Canvas;
