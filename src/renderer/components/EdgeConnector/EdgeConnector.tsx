// src/renderer/components/EdgeConnector/EdgeConnector.tsx
import React from 'react';
import { Edge } from '../../../shared/types/edge';
import './EdgeConnector.css';

interface EdgeConnectorProps {
  edge: Edge;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const EdgeConnector: React.FC<EdgeConnectorProps> = ({ edge, selected, onSelect }) => {
  // Handler for edge selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(edge.id);
  };

  // Determine the color of the edge
  const edgeColor = edge.color || getTypeColor(edge.type);

  return (
    <div
      className={`edge-connector ${selected ? 'selected' : ''}`}
      onClick={handleClick}
      style={{ borderColor: edgeColor }}
    >
      {edge.label && <div className="edge-label" style={{ backgroundColor: edgeColor }}>{edge.label}</div>}
    </div>
  );
};

// Helper function to get color based on edge type
function getTypeColor(type?: string): string {
  switch (type) {
    case 'success':
      return '#4CAF50'; // Green
    case 'failure':
      return '#F44336'; // Red
    case 'special':
      return '#FF9800'; // Orange
    default:
      return '#607D8B'; // Blue Grey
  }
}
