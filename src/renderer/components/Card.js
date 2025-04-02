// src/renderer/components/Card.js
import React, { useRef } from 'react';
import './Card.css';

const Card = ({ card, onSelect, isSelected, onDragStart, onDragEnd, position }) => {
  const cardRef = useRef(null);

  // Handle card selection
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(card.id);
  };

  // Handle drag start
  const handleDragStart = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    onDragStart(card.id, offsetX, offsetY);
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
        top: `${position.y}px`
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
