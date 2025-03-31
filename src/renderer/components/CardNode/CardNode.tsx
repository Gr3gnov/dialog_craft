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
      {/* Entry connection point */}
      <div className="card-entry-point"></div>

      <div className="card-content">
        <div className="card-avatar"></div>
        <div className="card-text-container">
          <div className="card-title">{card.title}</div>
          <div className="card-text">{card.text}</div>
        </div>
      </div>

      {/* Exit connection point */}
      <div className="card-exit-point"></div>

      {/* Edge connectors */}
      <div className="card-edge-connectors">
        <button
          className="edge-connector-button red"
          onClick={handleStartEdge}
          title="Create connection">
          <div className="connector-inner"></div>
        </button>
        <button
          className="edge-connector-button yellow"
          onClick={handleStartEdge}
          title="Create connection">
          <div className="connector-inner"></div>
        </button>
        <button
          className="edge-connector-button cyan"
          onClick={handleStartEdge}
          title="Create connection">
          <div className="connector-inner"></div>
        </button>
        <button
          className="edge-connector-button green"
          onClick={handleStartEdge}
          title="Create connection">
          <div className="connector-inner"></div>
        </button>
        <button
          className="edge-connector-button black"
          onClick={handleStartEdge}
          title="Create connection">
          <div className="connector-inner"></div>
        </button>
      </div>
    </div>
  );
};
