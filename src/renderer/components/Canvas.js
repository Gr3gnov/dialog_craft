// src/renderer/components/Canvas.js
import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import Connection from './Connection';
import './Canvas.css';

const Canvas = ({ cards, connections, onCardSelect, selectedCardId, onUpdateCard, onConnectionSelect, selectedConnectionId, onCreateConnection, createConnectionMode, sourceCardId }) => {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempConnection, setTempConnection] = useState(null);

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Zoom state
  const [scale, setScale] = useState(1);
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 3;
  const ZOOM_SENSITIVITY = 0.0005;

  // Handle canvas click (deselect)
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === 'svg') {
      onCardSelect(null);
      onConnectionSelect(null);
    }
  };

  // Calculate the center position of a card
  const getCardCenter = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return null;

    return {
      x: card.position.x + 250, // Half of card width (500px)
      y: card.position.y + 75   // Half of card height (150px)
    };
  };

  // Вычисляем точку на границе карточки вместо центра
  const getIntersectionWithCardBorder = (cardId, direction) => {
    const CARD_WIDTH = 500;
    const CARD_HEIGHT = 150;
    const HALF_WIDTH = CARD_WIDTH / 2;
    const HALF_HEIGHT = CARD_HEIGHT / 2;
    const MARGIN = 10; // Дополнительный отступ от края карточки для лучшего отображения стрелки

    const card = cards.find(c => c.id === cardId);
    if (!card) return null;

    const center = {
      x: card.position.x + HALF_WIDTH,
      y: card.position.y + HALF_HEIGHT
    };

    // Нормализуем вектор направления
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    const normalized = {
      x: direction.x / length,
      y: direction.y / length
    };

    // Вычисляем масштабные коэффициенты для пересечения с границами
    let scaleX = normalized.x !== 0 ? HALF_WIDTH / Math.abs(normalized.x) : Infinity;
    let scaleY = normalized.y !== 0 ? HALF_HEIGHT / Math.abs(normalized.y) : Infinity;

    // Берем минимальный коэффициент для нахождения первого пересечения
    const scale = Math.min(scaleX, scaleY);

    // Вычисляем точку пересечения, добавляем отступ в направлении вектора
    return {
      x: center.x + normalized.x * (scale + MARGIN),
      y: center.y + normalized.y * (scale + MARGIN)
    };
  };

  // Handle mouse move for card dragging, canvas panning, or connection creation
  const handleMouseMove = (e) => {
    if (dragging) {
      // Calculate position in canvas coordinates
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      // Transform to scaled canvas coordinates
      const canvasX = (mouseX - canvasOffset.x) / scale;
      const canvasY = (mouseY - canvasOffset.y) / scale;

      // Calculate new position accounting for drag offset
      const newPosition = {
        x: canvasX - dragOffset.x / scale,
        y: canvasY - dragOffset.y / scale
      };

      // Update card position
      const updatedCard = cards.find(card => card.id === dragging);
      if (updatedCard) {
        onUpdateCard({
          ...updatedCard,
          position: newPosition
        });
      }
    } else if (isPanning) {
      // Canvas panning
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;

      setCanvasOffset({
        x: canvasOffset.x + dx,
        y: canvasOffset.y + dy
      });

      setPanStart({
        x: e.clientX,
        y: e.clientY
      });
    } else if (createConnectionMode && sourceCardId) {
      // Connection creation mode
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - canvasRect.left - canvasOffset.x) / scale;
      const mouseY = (e.clientY - canvasRect.top - canvasOffset.y) / scale;

      const sourceCenter = getCardCenter(sourceCardId);
      if (sourceCenter) {
        setTempConnection({
          start: sourceCenter,
          end: { x: mouseX, y: mouseY }
        });
      }
    }
  };

  // Handle mouse up to end dragging or panning
  const handleMouseUp = () => {
    if (dragging) {
      console.log('End dragging card', dragging);
      setDragging(null);
    }
    if (isPanning) {
      setIsPanning(false);
    }
    // Connection creation happens on card click in connection mode, not on mouse up
  };

  // Handle mouse down for panning
  const handleMouseDown = (e) => {
    // Middle mouse button (wheel) or space + left click
    if (e.button === 1 || (spacePressed && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  // Handle card click in connection mode
  const handleCardClick = (cardId) => {
    if (createConnectionMode && sourceCardId) {
      // If already in connection mode and we have a source, create connection to this card
      if (sourceCardId !== cardId) {
        onCreateConnection(sourceCardId, cardId);
        // Exit connection mode immediately after creating connection
        setTempConnection(null);
      }
    } else {
      // Normal card selection
      onCardSelect(cardId);
    }
  };

  // Reset temporary connection when exiting connection mode
  useEffect(() => {
    if (!createConnectionMode) {
      setTempConnection(null);
    }
  }, [createConnectionMode]);

  // Handle wheel event for zooming
  const handleWheel = (e) => {
    e.preventDefault();

    // Get mouse position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate zoom factor
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (1 + delta)));

    // Calculate new offset to zoom toward mouse position
    const scaleRatio = newScale / scale;
    const newOffsetX = mouseX - (mouseX - canvasOffset.x) * scaleRatio;
    const newOffsetY = mouseY - (mouseY - canvasOffset.y) * scaleRatio;

    setScale(newScale);
    setCanvasOffset({
      x: newOffsetX,
      y: newOffsetY
    });
  };

  // Handle keyboard events for space bar
  const handleKeyDown = (e) => {
    if (e.code === 'Space' && !spacePressed) {
      setSpacePressed(true);
      // Change cursor to indicate panning is available
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === 'Space') {
      setSpacePressed(false);
      // Restore cursor
      if (canvasRef.current) {
        canvasRef.current.style.cursor = createConnectionMode ? 'crosshair' : 'default';
      }
    }
  };

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      if (canvasElement) {
        canvasElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [dragging, dragOffset, cards, isPanning, panStart, canvasOffset, spacePressed, scale, createConnectionMode, sourceCardId]);

  const handleCardDragStart = (id, offsetX, offsetY) => {
    if (!isPanning && !spacePressed && !createConnectionMode) {
      setDragging(id);
      setDragOffset({
        x: offsetX,
        y: offsetY
      });
    }
  };

  return (
    <div
      ref={canvasRef}
      className={`canvas ${createConnectionMode ? 'connection-mode' : ''}`}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      style={{ cursor: spacePressed ? 'grab' : createConnectionMode ? 'crosshair' : 'default' }}
    >
      <div
        className="canvas-content"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          width: '10000px', // Увеличиваем размер для предотвращения обрезания линий
          height: '10000px' // Увеличиваем размер для предотвращения обрезания линий
        }}
      >
        <svg className="connections-layer" width="100%" height="100%" style={{overflow: 'visible'}}>
          {/* SVG определения для стрелок соединений */}
          <defs>
            <marker
              id="arrow-normal"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
              className="arrow-marker"
            >
              <path d="M 0 6 L 12 1 L 10 6 L 12 11 Z" fill="#444" stroke="none" />
            </marker>
            <marker
              id="arrow-selected"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
              className="arrow-marker"
            >
              <path d="M 0 6 L 12 1 L 10 6 L 12 11 Z" fill="#3498db" stroke="none" />
            </marker>
          </defs>

          {/* Render permanent connections */}
          {connections.map((connection) => {
            const sourceCenter = getCardCenter(connection.sourceId);
            const targetCenter = getCardCenter(connection.targetId);

            if (!sourceCenter || !targetCenter) return null;

            // Вычисляем направление от центра источника к центру цели
            const directionToTarget = {
              x: targetCenter.x - sourceCenter.x,
              y: targetCenter.y - sourceCenter.y
            };

            // Вычисляем направление от центра цели к центру источника (обратное)
            const directionToSource = {
              x: -directionToTarget.x,
              y: -directionToTarget.y
            };

            // Получаем точки пересечения с границами карточек
            const startPoint = getIntersectionWithCardBorder(connection.sourceId, directionToTarget);
            const endPoint = getIntersectionWithCardBorder(connection.targetId, directionToSource);

            if (!startPoint || !endPoint) return null;

            return (
              <Connection
                key={connection.id}
                connection={connection}
                startPoint={startPoint}
                endPoint={endPoint}
                sourceCenter={sourceCenter}
                targetCenter={targetCenter}
                isSelected={connection.id === selectedConnectionId}
                onSelect={onConnectionSelect}
              />
            );
          })}

          {/* Render temporary connection while creating */}
          {tempConnection && sourceCardId && (
            <>
              {(() => {
                const sourceCenter = getCardCenter(sourceCardId);
                if (!sourceCenter) return null;

                const directionToMouse = {
                  x: tempConnection.end.x - sourceCenter.x,
                  y: tempConnection.end.y - sourceCenter.y
                };

                // Получаем точку на границе исходной карточки
                const startBorderPoint = getIntersectionWithCardBorder(sourceCardId, directionToMouse);
                if (!startBorderPoint) return null;

                // Рисуем простую линию от границы до курсора
                return (
                  <>
                    <path
                      d={`M ${startBorderPoint.x} ${startBorderPoint.y} L ${tempConnection.end.x} ${tempConnection.end.y}`}
                      stroke="#3498db"
                      strokeWidth={2}
                      strokeDasharray="5,5"
                      fill="none"
                    />

                    {/* Добавляем стрелку на конце временной линии */}
                    {(() => {
                      // Нормализуем вектор направления
                      const length = Math.sqrt(directionToMouse.x * directionToMouse.x + directionToMouse.y * directionToMouse.y);
                      const normalizedDirX = directionToMouse.x / length;
                      const normalizedDirY = directionToMouse.y / length;

                      // Параметры стрелки
                      const arrowLength = 20;
                      const arrowWidth = 10;

                      // Вектора перпендикулярные основному направлению для создания "крыльев" стрелки
                      const perpX = -normalizedDirY;
                      const perpY = normalizedDirX;

                      // Точки основания стрелки
                      const arrowBase1X = tempConnection.end.x - normalizedDirX * arrowLength + perpX * arrowWidth;
                      const arrowBase1Y = tempConnection.end.y - normalizedDirY * arrowLength + perpY * arrowWidth;

                      const arrowBase2X = tempConnection.end.x - normalizedDirX * arrowLength - perpX * arrowWidth;
                      const arrowBase2Y = tempConnection.end.y - normalizedDirY * arrowLength - perpY * arrowWidth;

                      // Создаем полигон для стрелки
                      const arrowPoints = `${tempConnection.end.x},${tempConnection.end.y} ${arrowBase1X},${arrowBase1Y} ${arrowBase2X},${arrowBase2Y}`;

                      return (
                        <polygon
                          points={arrowPoints}
                          fill="#3498db"
                          stroke="none"
                          className="connection-arrow"
                        />
                      );
                    })()}
                  </>
                );
              })()}
            </>
          )}
        </svg>

        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onSelect={handleCardClick}
            isSelected={card.id === selectedCardId}
            onDragStart={handleCardDragStart}
            onDragEnd={handleMouseUp}
            position={card.position}
            scale={scale}
            connectionMode={createConnectionMode}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="zoom-indicator">
        {Math.round(scale * 100)}%
      </div>

      {/* Connection mode indicator */}
      {createConnectionMode && (
        <div className="connection-indicator">
          {sourceCardId ? "Select target card" : "Select source card"}
        </div>
      )}
    </div>
  );
};

export default Canvas;
