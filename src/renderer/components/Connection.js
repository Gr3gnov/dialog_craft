// src/renderer/components/Connection.js
import React from 'react';
import './Connection.css';

const Connection = ({ connection, startPoint, endPoint, isSelected, onSelect, sourceCenter, targetCenter }) => {
  // Calculate control points for a curved connection (Bezier curve)
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;

  // Make the curve more pronounced if the cards are mostly horizontal
  const offset = Math.abs(dy) < 100 ? 50 : 0;
  const cp1x = startPoint.x + dx * 0.3;
  const cp1y = startPoint.y + offset;
  const cp2x = startPoint.x + dx * 0.7;
  const cp2y = endPoint.y + offset;

  // Create SVG path for the connection
  const path = `M ${startPoint.x} ${startPoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPoint.x} ${endPoint.y}`;

  // Calculate position for connection label
  const labelX = startPoint.x + dx / 2;
  const labelY = startPoint.y + dy / 2 - 10; // Slightly above the curve

  // Handle connection selection
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(connection.id);
  };

  // Расчёт стрелки, всегда направленной от центра исходной карточки к центру целевой
  const calculateArrow = () => {
    if (!sourceCenter || !targetCenter) return null;

    // Вектор направления от центра исходной карточки к центру целевой
    const dirX = targetCenter.x - sourceCenter.x;
    const dirY = targetCenter.y - sourceCenter.y;

    // Нормализуем вектор
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    const normalizedDirX = dirX / length;
    const normalizedDirY = dirY / length;

    // Параметры стрелки
    const arrowLength = 20;
    const arrowWidth = 10;

    // Вычисляем точки для стрелки
    // Точка наконечника находится на границе целевой карточки
    const arrowTip = endPoint;

    // Вектора перпендикулярные основному направлению для создания "крыльев" стрелки
    const perpX = -normalizedDirY;
    const perpY = normalizedDirX;

    // Точки основания стрелки
    const arrowBase1X = arrowTip.x - normalizedDirX * arrowLength + perpX * arrowWidth;
    const arrowBase1Y = arrowTip.y - normalizedDirY * arrowLength + perpY * arrowWidth;

    const arrowBase2X = arrowTip.x - normalizedDirX * arrowLength - perpX * arrowWidth;
    const arrowBase2Y = arrowTip.y - normalizedDirY * arrowLength - perpY * arrowWidth;

    return `${arrowTip.x},${arrowTip.y} ${arrowBase1X},${arrowBase1Y} ${arrowBase2X},${arrowBase2Y}`;
  };

  const arrowPoints = calculateArrow();
  const currentColor = isSelected ? "#3498db" : "#444";

  return (
    <g className={`connection ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
      {/* Connection path without marker-end */}
      <path
        d={path}
        stroke={currentColor}
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
        strokeDasharray={connection.type === 'conditional' ? "5,5" : "none"}
      />

      {/* Отдельная стрелка, направленная от центра к центру */}
      {arrowPoints && (
        <polygon
          points={arrowPoints}
          fill={currentColor}
          stroke="none"
          className="connection-arrow"
        />
      )}

      {/* Connection label */}
      {connection.label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          fill={isSelected ? "#3498db" : "#666"}
          fontSize="12"
          className="connection-label"
        >
          {connection.label}
        </text>
      )}
    </g>
  );
};

export default Connection;
