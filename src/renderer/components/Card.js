// src/renderer/components/Card.js
import React, { useRef } from 'react';
import './Card.css';

const Card = ({ card, onSelect, isSelected, onDragStart, onDragEnd, position, scale = 1, connectionMode = false, onStartConnection }) => {
  const cardRef = useRef(null);

  // Используем относительный путь к скопированному ресурсу
  const defaultAvatar = './assets/default_avatar.png';
  const truncateText = (text, maxLength = 300) => { // Увеличиваем с 100 до 300 символов
    if (!text) return 'Empty dialog...';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };
  // Определяем классы для карточки
  const cardClasses = [
    'dialog-card',
    isSelected ? 'selected' : '',
    card.is_narrator ? 'narrator' : '',
    card.is_thought ? 'thought' : '',
    connectionMode ? 'connection-mode' : ''
  ].filter(Boolean).join(' ');

  // Handle card selection
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(card.id);
  };

  // Handle connection button click
  const handleStartConnection = (e) => {
    e.stopPropagation();
    if (onStartConnection) {
      onStartConnection(card.id);
    }
  };

  // Handle drag start
  const handleDragStart = (e) => {
    // Don't start dragging in connection mode
    if (connectionMode) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      onDragStart(card.id, offsetX, offsetY);
    }
  };

  // Handle mouse up to end dragging
  const handleDragEnd = () => {
    if (!connectionMode) {
      onDragEnd();
    }
  };

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: connectionMode ? 'crosshair' : 'grab'
      }}
      onClick={handleClick}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
    >
      <div className="card-header">
        <div className="card-title">{card.title || 'Untitled'}</div>
      </div>
      <div className="card-body">
        <div className="card-portrait">
          <img
            src={card.portrait || defaultAvatar}
            alt={card.character_name || "Character"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
        </div>
        <div className="card-content">
          {card.character_name && <div className="character-name">{card.character_name}</div>}
          <div className="card-text">{truncateText(card.text)}</div>
        </div>
      </div>

      {/* Connection button at the bottom left */}
      <div className="connection-button" onClick={handleStartConnection} title="Create connection">
        <span>+</span>
      </div>

      {/* Connection target indicator at the top */}
      <div className="connection-target" />
    </div>
  );
};

export default Card;
