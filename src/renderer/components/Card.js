// src/renderer/components/Card.js
import React, { useRef } from 'react';
import './Card.css';

const Card = ({ card, onSelect, isSelected, onDragStart, onDragEnd, position, scale = 1 }) => {
  const cardRef = useRef(null);

  // Handle card selection
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(card.id);
  };

  // Handle drag start
  const handleDragStart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      console.log('Card rect:', rect);
      console.log('Mouse position at drag start:', { clientX: e.clientX, clientY: e.clientY });
      console.log('Calculated offsets:', { offsetX, offsetY });

      onDragStart(card.id, offsetX, offsetY);
    }
  };

  // Handle mouse up to end dragging
  const handleDragEnd = () => {
    onDragEnd();
  };

  return (
    <div
      ref={cardRef}
      className={`dialog-card ${isSelected ? 'selected' : ''} ${card.type === 'narrator' ? 'narrator' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        // Don't apply scale here, it's handled by the parent
        transform: 'translate(0, 0)'  // Reset any transforms
      }}
      onClick={handleClick}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
    >
      <div className="card-header">
        <div className="card-title">{card.title || 'Untitled'}</div>
      </div>
      <div className="card-content">
        {card.text || 'Empty dialog...'}
      </div>
    </div>
  );
};

export default Card;
