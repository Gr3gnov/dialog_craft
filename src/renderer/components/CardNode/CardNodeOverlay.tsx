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
      <div
        className="card-entry-point"
        onClick={handleClick}
        style={{ pointerEvents: 'auto' }}
      />

      <div
        className="card-exit-point"
        style={{ pointerEvents: 'auto' }}
      />

      <div className="card-edge-connectors" style={{ pointerEvents: 'auto' }}>
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
    </NodeOverlay>
  );
};
