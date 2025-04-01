// src/renderer/components/Connection/Connection.tsx
import React from 'react';
import './Connection.css';

interface ConnectionProps {
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  label?: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}

export const Connection: React.FC<ConnectionProps> = ({
  sourcePosition,
  targetPosition,
  label,
  color,
  selected,
  onClick
}) => {
  // Calculate control points for the bezier curve
  const midX = (sourcePosition.x + targetPosition.x) / 2;
  const midY = (sourcePosition.y + targetPosition.y) / 2;

  // Calculate direction vector
  const dx = targetPosition.x - sourcePosition.x;
  const dy = targetPosition.y - sourcePosition.y;

  // Calculate perpendicular vector for the control point offset
  const perpX = -dy * 0.5;
  const perpY = dx * 0.5;

  // Set control point offset from midpoint
  const ctrlX = midX + perpX;
  const ctrlY = midY + perpY;

  // Calculate position for the label
  const labelX = ctrlX;
  const labelY = ctrlY;

  return (
    <div className="connection-container">
      <svg
        className={`connection ${selected ? 'selected' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <path
          d={`M${sourcePosition.x},${sourcePosition.y} Q${ctrlX},${ctrlY} ${targetPosition.x},${targetPosition.y}`}
          stroke={color}
          strokeWidth={selected ? 3 : 2}
          fill="none"
        />
        <circle
          cx={targetPosition.x}
          cy={targetPosition.y}
          r={4}
          fill={color}
        />
      </svg>

      {label && (
        <div
          className="connection-label"
          style={{
            left: labelX,
            top: labelY,
            backgroundColor: color
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
