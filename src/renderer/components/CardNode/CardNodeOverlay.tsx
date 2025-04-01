// src/renderer/components/CardNode/CardNodeOverlay.tsx
import React from 'react';
import { Card } from '../../../shared/types/card';
import { NodeOverlay } from '../../contexts/OverlayContext';
import './CardNode.css';

interface CardNodeOverlayProps {
  card: Card;
  selected: boolean;
  onSelect: (id: number) => void;
  onStartEdge: (sourceId: number) => void;
}

export const CardNodeOverlay: React.FC<CardNodeOverlayProps> = ({
  card,
  selected,
  onSelect,
  onStartEdge
}) => {
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
    <NodeOverlay nodeId={card.id.toString()}>
      {/* Оборачиваем только те элементы, с которыми нужно взаимодействовать */}
      <div
        className="card-entry-point"
        onClick={handleClick}
        style={{ pointerEvents: 'auto', position: 'absolute', top: '-5px', left: '15px' }}
      />

      <div
        className="card-exit-point"
        style={{ pointerEvents: 'auto', position: 'absolute', bottom: '-5px', right: '15px' }}
      />

      <div className="card-edge-connectors" style={{ pointerEvents: 'none', position: 'absolute', bottom: '-20px', left: '10px', display: 'flex', gap: '19px' }}>
        {['red', 'yellow', 'cyan', 'green', 'black'].map((color, index) => (
          <button
            key={color}
            className={`edge-connector-button ${color}`}
            onClick={handleStartEdge}
            style={{ pointerEvents: 'auto' }} // Enable interaction only for buttons
            title="Create connection">
            <div className="connector-inner"></div>
          </button>
        ))}
      </div>
    </NodeOverlay>
  );
};
