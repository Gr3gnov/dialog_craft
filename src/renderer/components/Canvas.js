// src/renderer/components/Canvas.js
import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import Connection from './Connection';
import './Canvas.css';

const Canvas = ({
  cards,
  connections,
  onCardSelect,
  selectedCardId,
  onUpdateCard,
  onConnectionSelect,
  selectedConnectionId,
  onCreateConnection,
  createConnectionMode,
  sourceCardId,
  setSourceCardId,
  onStartConnection,
  onDeleteCard
}) => {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempConnection, setTempConnection] = useState(null);

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Connection state
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);

  // Zoom state
  const [scale, setScale] = useState(1);
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 3;
  const ZOOM_SENSITIVITY = 0.0005;

  // Get connection points for source and target cards
  const getConnectionSourcePoint = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return null;

    // Position for connection button (bottom left)
    return {
      x: card.position.x + 20, // Connection button is positioned 20px from left
      y: card.position.y + 150 // Connection button is at bottom of card (150px height)
    };
  };

  const getConnectionTargetPoint = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return null;

    // Позиция для круга соединения на верхней грани карточки
    // CSS: top: -8px; left: 50%; transform: translateX(-50%);
    return {
      x: card.position.x + 250, // Середина карточки (500px width / 2)
      y: card.position.y - 8    // Чуть выше верхнего края (-8px)
    };
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

  // Handle canvas click (deselect)
  const handleCanvasClick = (e) => {
    console.log('Canvas click detected', e.target);

    // Проверяем, что клик был на пустой области холста или на слое соединений
    // Также добавляем проверку на canvas-content, который занимает всё пространство
    if (e.target === canvasRef.current ||
        e.target.className === 'connections-layer' ||
        e.target.className === 'canvas-content' ||
        e.target.tagName.toLowerCase() === 'svg') {

      console.log('Click on empty canvas area detected');

      // If in connection mode and clicking on canvas, cancel connection
      if (isCreatingConnection) {
        setIsCreatingConnection(false);
        setTempConnection(null);
        setSourceCardId(null);
      }

      // Напрямую сообщаем о выходе из режима связи
      if (createConnectionMode) {
        // Напрямую вызываем обработчик в App.js для выхода из режима связи
        onCardSelect(null);
        // Также сбрасываем локальные состояния
        setSourceCardId(null);
        setIsCreatingConnection(false);
        setTempConnection(null);
      }

      // Normal selection deselect
      onCardSelect(null);
      onConnectionSelect(null);
    }
  };

  // Start connection creation from a card
  const handleStartConnection = (cardId) => {
    onStartConnection(cardId);
    setIsCreatingConnection(true);

    // Initialize temporary connection
    const sourcePoint = getConnectionSourcePoint(cardId);
    if (sourcePoint) {
      setTempConnection({
        start: sourcePoint,
        end: sourcePoint // Initially set to same point, will update with mouse movement
      });
    }
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
    } else if (isCreatingConnection && sourceCardId) {
      // Connection creation mode with new button
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - canvasRect.left - canvasOffset.x) / scale;
      const mouseY = (e.clientY - canvasRect.top - canvasOffset.y) / scale;

      const sourcePoint = getConnectionSourcePoint(sourceCardId);
      if (sourcePoint) {
        setTempConnection({
          start: sourcePoint,
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
    if (isCreatingConnection && sourceCardId) {
      // If already in connection mode and we have a source, create connection to this card
      if (sourceCardId !== cardId) {
        onCreateConnection(sourceCardId, cardId);
        // Exit connection mode after creating connection
        setTempConnection(null);
        setIsCreatingConnection(false);
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
      setIsCreatingConnection(false);
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
      className={`canvas ${isCreatingConnection || createConnectionMode ? 'connection-mode' : ''}`}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      style={{ cursor: spacePressed ? 'grab' : (isCreatingConnection || createConnectionMode) ? 'crosshair' : 'default' }}
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
            const sourcePoint = getConnectionSourcePoint(connection.sourceId);
            const targetPoint = getConnectionTargetPoint(connection.targetId);

            if (!sourcePoint || !targetPoint) return null;

            return (
              <Connection
                key={connection.id}
                connection={connection}
                startPoint={sourcePoint}
                endPoint={targetPoint}
                sourceCenter={getCardCenter(connection.sourceId)}
                targetCenter={getCardCenter(connection.targetId)}
                isSelected={connection.id === selectedConnectionId}
                onSelect={onConnectionSelect}
                cards={cards} // Передаем весь массив карточек для определения маршрута
              />
            );
          })}

          {/* Render temporary connection while creating */}
          {tempConnection && sourceCardId && (
            <g>
              <polyline
                points={
                  tempConnection.start && tempConnection.end ?
                  `${tempConnection.start.x},${tempConnection.start.y}
                  ${tempConnection.start.x},${tempConnection.start.y + 40}
                  ${(tempConnection.start.x + tempConnection.end.x - 50)/2},${tempConnection.start.y + 40}
                  ${(tempConnection.start.x + tempConnection.end.x - 50)/2},${tempConnection.end.y}
                  ${tempConnection.end.x - 50},${tempConnection.end.y}
                  ${tempConnection.end.x},${tempConnection.end.y}`
                  : ''
                }
                stroke="#3498db"
                strokeWidth={2}
                strokeDasharray="5,5"
                fill="none"
              />
              {/* Стрелка для временного соединения */}
              <polygon
                points={
                  tempConnection.end ?
                  `${tempConnection.end.x},${tempConnection.end.y}
                  ${tempConnection.end.x-8},${tempConnection.end.y-15}
                  ${tempConnection.end.x+8},${tempConnection.end.y-15}`
                  : ''
                }
                fill="#3498db"
                stroke="none"
              />
            </g>
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
            connectionMode={isCreatingConnection || createConnectionMode}
            onStartConnection={handleStartConnection}
            onDelete={onDeleteCard}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="zoom-indicator">
        {Math.round(scale * 100)}%
      </div>

      {/* Connection mode indicator */}
      {isCreatingConnection && (
        <div className="connection-indicator">
          {sourceCardId ? "Select target card" : "Select source card"}
        </div>
      )}
    </div>
  );
};

export default Canvas;
