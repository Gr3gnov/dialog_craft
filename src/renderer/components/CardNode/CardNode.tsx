// src/renderer/components/CardNode/CardNode.tsx
import React from 'react';
import { Card } from '../../../shared/types/card';
import './CardNode.css';

interface CardNodeProps {
  card: Card;
  selected: boolean;
  onSelect: (id: number) => void;
  onStartEdge: (sourceId: number) => void;
}

export const CardNode: React.FC<CardNodeProps> = ({ card, selected, onSelect, onStartEdge }) => {
  // Handler for card selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(card.id);
  };

  // Handler for starting edge creation
  const handleStartEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEdge(card.id);
  };

  return (
    <div
      className={`card-node ${selected ? 'selected' : ''} ${card.is_narrator ? 'narrator' : ''} ${card.is_thought ? 'thought' : ''}`}
      onClick={handleClick}
    >
      <div className="card-header">
        <div className="card-title">{card.title}</div>
        {card.character_name && <div className="card-character">{card.character_name}</div>}
      </div>
      <div className="card-content">
        <div className="card-text">{card.text}</div>
      </div>
      <div className="card-actions">
        <button className="edge-button" onClick={handleStartEdge} title="Создать связь">
          <span>+</span>
        </button>
      </div>
    </div>
  );
};
