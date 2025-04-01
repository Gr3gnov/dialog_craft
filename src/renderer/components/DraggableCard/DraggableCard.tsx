// src/renderer/components/DraggableCard/DraggableCard.tsx
import React, { useRef } from 'react';
import { Card } from '../../../shared/types/card';
import { useDraggable } from '../../hooks/useDraggable';
import './DraggableCard.css';

interface DraggableCardProps {
  card: Card;
  selected: boolean;
  onSelect: () => void;
  onStartEdge: (cardId: number) => void;
  onHoverForEdge: (cardId: number) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  selected,
  onSelect,
  onStartEdge,
  onHoverForEdge,
  onPositionChange
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Use draggable hook to make card draggable
  useDraggable(cardRef, card.position, {
    onDragEnd: onPositionChange
  });

  // Handle mouse enter for edge connection
  const handleMouseEnter = () => {
    onHoverForEdge(card.id);
  };

  return (
    <div
      ref={cardRef}
      className={`draggable-card ${selected ? 'selected' : ''} ${card.is_narrator ? 'narrator' : ''} ${card.is_thought ? 'thought' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={handleMouseEnter}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        // transform is applied by the useDraggable hook
      }}
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
      <div className="card-exit-point" onClick={(e) => {
        e.stopPropagation();
        onStartEdge(card.id);
      }}></div>

      {/* Edge connectors */}
      <div className="card-edge-connectors">
        {['red', 'yellow', 'cyan', 'green', 'black'].map((color) => (
          <button
            key={color}
            className={`edge-connector-button ${color}`}
            onClick={(e) => {
              e.stopPropagation();
              onStartEdge(card.id);
            }}
            title="Create connection"
          >
            <div className="connector-inner"></div>
          </button>
        ))}
      </div>
    </div>
  );
};
