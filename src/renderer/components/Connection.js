// src/renderer/components/Connection.js
import React from 'react';
import './Connection.css';

const Connection = ({ connection, startPoint, endPoint, isSelected, onSelect, sourceCenter, targetCenter, cards }) => {
  // Обрабатываем нажатие на соединение
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(connection.id);
  };

  // Константы для логики расчета путей
  const CARD_PADDING = 20; // Отступ от карточек
  const ARROW_LENGTH = 15;
  const MIN_LAST_SEGMENT_LENGTH = ARROW_LENGTH * 3; // Минимальная длина последнего сегмента (3 размера стрелки)

  // Расчет промежуточных точек для ломаной линии, обходящей карточки
  const calculatePolylinePath = () => {
    // Изменяем логику: всегда строим ломаную линию, даже если нет препятствий
    return createRoutingPath(startPoint, endPoint);
  };

  // Проверка, пересекает ли прямая линия между точками какую-либо карточку
  const checkForObstacles = (start, end) => {
    if (!cards || cards.length === 0) return false;

    // Проверяем пересечение с каждой карточкой
    return cards.some(card => {
      // Игнорируем карточки-источник и карточки-назначение
      if (card.id === connection.sourceId || card.id === connection.targetId) return false;

      // Расчет координат углов карточки
      const cardLeft = card.position.x;
      const cardRight = cardLeft + 500; // ширина карточки
      const cardTop = card.position.y;
      const cardBottom = cardTop + 150; // высота карточки

      // Проверка пересечения линии с прямоугольником карточки
      return lineIntersectsRectangle(start, end, cardLeft, cardTop, cardRight, cardBottom);
    });
  };

  // Проверка пересечения линии с прямоугольником
  const lineIntersectsRectangle = (p1, p2, left, top, right, bottom) => {
    // Проверяем пересечение с каждой из 4 сторон прямоугольника
    return (
      lineIntersectsLine(p1, p2, {x: left, y: top}, {x: right, y: top}) || // верх
      lineIntersectsLine(p1, p2, {x: right, y: top}, {x: right, y: bottom}) || // право
      lineIntersectsLine(p1, p2, {x: left, y: bottom}, {x: right, y: bottom}) || // низ
      lineIntersectsLine(p1, p2, {x: left, y: top}, {x: left, y: bottom}) // лево
    );
  };

  // Проверка пересечения двух линий
  const lineIntersectsLine = (l1p1, l1p2, l2p1, l2p2) => {
    // Алгоритм проверки пересечения двух отрезков
    const s1_x = l1p2.x - l1p1.x;
    const s1_y = l1p2.y - l1p1.y;
    const s2_x = l2p2.x - l2p1.x;
    const s2_y = l2p2.y - l2p1.y;

    const s = (-s1_y * (l1p1.x - l2p1.x) + s1_x * (l1p1.y - l2p1.y)) / (-s2_x * s1_y + s1_x * s2_y);
    const t = (s2_x * (l1p1.y - l2p1.y) - s2_y * (l1p1.x - l2p1.x)) / (-s2_x * s1_y + s1_x * s2_y);

    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
  };

  // Создание маршрута обхода препятствий с обязательными вертикальными первым и последним сегментами
  const createRoutingPath = (start, end) => {
    // Определяем основной вектор направления
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Константа для минимального расстояния от точек по вертикали/горизонтали
    const VERTICAL_OFFSET = 40;
    const HORIZONTAL_OFFSET = 50;

    // Вычисляем промежуточные точки
    const startVerticalOffset = start.y > end.y ? -VERTICAL_OFFSET : VERTICAL_OFFSET;
    const firstPoint = {
      x: start.x,
      y: start.y + startVerticalOffset // Первый сегмент - вертикальный
    };

    // Важное изменение: создаем предпоследнюю точку с тем же x-координатой, что и конечная точка,
    // но с другой y-координатой для обеспечения вертикального последнего сегмента
    const lastVerticalOffset = 50; // Смещение для последнего вертикального сегмента
    const preLastPoint = {
      x: end.x,
      y: end.y < start.y ? end.y + lastVerticalOffset : end.y - lastVerticalOffset
    };

    // Промежуточные точки для маршрута
    const midPoint = {
      x: (start.x + end.x) / 2,
      y: firstPoint.y
    };

    const beforeLastPoint = {
      x: end.x,
      y: midPoint.y
    };

    // Создаем базовый маршрут с вертикальными первым и последним сегментами
    let route = [
      start,              // Начальная точка
      firstPoint,         // Вертикальный первый сегмент
      midPoint,           // Горизонтальный сегмент
      beforeLastPoint,    // Вертикальный сегмент до x-координаты конечной точки
      preLastPoint,       // Точка перед конечной, с тем же x
      end                 // Конечная точка (создаст строго вертикальный последний сегмент)
    ];

    // Проверяем, нет ли наложений маршрута на карточки
    // Если есть, добавляем дополнительные точки для обхода
    if (cards && cards.length > 0) {
      for (let i = 0; i < route.length - 1; i++) {
        const segment = { start: route[i], end: route[i+1] };

        cards.forEach(card => {
          if (card.id === connection.sourceId || card.id === connection.targetId) return;

          // Проверяем пересечение сегмента с карточкой
          const cardLeft = card.position.x - CARD_PADDING;
          const cardRight = cardLeft + 500 + CARD_PADDING*2;
          const cardTop = card.position.y - CARD_PADDING;
          const cardBottom = cardTop + 150 + CARD_PADDING*2;

          if (lineIntersectsRectangle(segment.start, segment.end, cardLeft, cardTop, cardRight, cardBottom)) {
            // Если есть пересечение, корректируем маршрут
            if (segment.start.x === segment.end.x) {
              // Вертикальный сегмент - смещаем горизонтально
              if (segment.start.x < cardLeft) {
                // Смещаем влево от карточки
                route[i].x = cardLeft - CARD_PADDING;
                route[i+1].x = cardLeft - CARD_PADDING;

                // Если это предпоследний сегмент, убеждаемся, что он переходит к x-координате end.x
                if (i === route.length - 3) {
                  route[i+1].x = end.x;
                }
              } else {
                // Смещаем вправо от карточки
                route[i].x = cardRight + CARD_PADDING;
                route[i+1].x = cardRight + CARD_PADDING;

                // Если это предпоследний сегмент, убеждаемся, что он переходит к x-координате end.x
                if (i === route.length - 3) {
                  route[i+1].x = end.x;
                }
              }
            } else {
              // Горизонтальный сегмент - смещаем вертикально
              if (segment.start.y < cardTop) {
                // Смещаем выше карточки
                route[i].y = cardTop - CARD_PADDING;
                route[i+1].y = cardTop - CARD_PADDING;
              } else {
                // Смещаем ниже карточки
                route[i].y = cardBottom + CARD_PADDING;
                route[i+1].y = cardBottom + CARD_PADDING;
              }
            }
          }
        });
      }
    }

    // Критически важное изменение: гарантировать, что предпоследняя точка имеет тот же x, что и конечная
    // Это обеспечит строго вертикальный последний сегмент
    route[route.length - 2].x = end.x;

    return route;
  };

  // Расчет точек ломаной линии
  const routePoints = calculatePolylinePath();

  // Форматирование точек для polyline
  const pointsString = routePoints
    .map(point => `${point.x},${point.y}`)
    .join(' ');

  // Расчет стрелки указывающей на целевую точку
  const calculateArrow = () => {
    // Проверяем, что у нас есть как минимум две точки в маршруте
    if (!routePoints || routePoints.length < 2) {
      // В случае проблем возвращаем безопасные значения для стрелки прямо вниз
      return `${endPoint.x},${endPoint.y} ${endPoint.x-8},${endPoint.y-15} ${endPoint.x+8},${endPoint.y-15}`;
    }

    // Находим предпоследнюю точку для расчета направления стрелки
    const lastSegmentStartIdx = routePoints.length - 2;
    const preLastPoint = routePoints[lastSegmentStartIdx];

    // Проверяем, что точки различаются (избегаем деления на ноль)
    const dirX = endPoint.x - preLastPoint.x;
    const dirY = endPoint.y - preLastPoint.y;

    const length = Math.sqrt(dirX * dirX + dirY * dirY);

    // Если длина вектора близка к нулю, используем вертикальную стрелку
    if (length < 0.001) {
      return `${endPoint.x},${endPoint.y} ${endPoint.x-8},${endPoint.y-15} ${endPoint.x+8},${endPoint.y-15}`;
    }

    // Нормализация вектора
    const normalizedDirX = dirX / length;
    const normalizedDirY = dirY / length;

    // Параметры стрелки
    const arrowLength = ARROW_LENGTH;
    const arrowWidth = 8;

    // Точка кончика стрелки
    const arrowTip = endPoint;

    // Перпендикулярные векторы для создания "крыльев" стрелки
    const perpX = -normalizedDirY;
    const perpY = normalizedDirX;

    // Базовые точки для стрелки
    const arrowBase1X = arrowTip.x - normalizedDirX * arrowLength + perpX * arrowWidth;
    const arrowBase1Y = arrowTip.y - normalizedDirY * arrowLength + perpY * arrowWidth;

    const arrowBase2X = arrowTip.x - normalizedDirX * arrowLength - perpX * arrowWidth;
    const arrowBase2Y = arrowTip.y - normalizedDirY * arrowLength - perpY * arrowWidth;

    // Проверяем результаты на NaN и заменяем их безопасными значениями
    const safeBase1X = isNaN(arrowBase1X) ? arrowTip.x - 8 : arrowBase1X;
    const safeBase1Y = isNaN(arrowBase1Y) ? arrowTip.y - 15 : arrowBase1Y;
    const safeBase2X = isNaN(arrowBase2X) ? arrowTip.x + 8 : arrowBase2X;
    const safeBase2Y = isNaN(arrowBase2Y) ? arrowTip.y - 15 : arrowBase2Y;

    return `${arrowTip.x},${arrowTip.y} ${safeBase1X},${safeBase1Y} ${safeBase2X},${safeBase2Y}`;
  };

  const arrowPoints = calculateArrow();
  const currentColor = isSelected ? "#3498db" : "#444";

  // Расчет позиции для метки соединения
  const calculateLabelPosition = () => {
    // Проверяем, что у нас есть достаточно точек
    if (!routePoints || routePoints.length < 3) {
      // В случае проблем возвращаем безопасные значения между начальной и конечной точками
      return {
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2 - 10
      };
    }

    // Находим середину ломаной линии
    const middleSegmentIdx = Math.floor(routePoints.length / 2) - 1;
    const p1 = routePoints[middleSegmentIdx];
    const p2 = routePoints[middleSegmentIdx + 1];

    // Проверяем, что точки определены
    if (!p1 || !p2 || typeof p1.x !== 'number' || typeof p1.y !== 'number' ||
        typeof p2.x !== 'number' || typeof p2.y !== 'number') {
      return {
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2 - 10
      };
    }

    const x = (p1.x + p2.x) / 2;
    const y = (p1.y + p2.y) / 2 - 10; // Немного выше линии

    // Проверяем результаты на NaN
    return {
      x: isNaN(x) ? (startPoint.x + endPoint.x) / 2 : x,
      y: isNaN(y) ? (startPoint.y + endPoint.y) / 2 - 10 : y
    };
  };

  const labelPosition = calculateLabelPosition();

  return (
    <g className={`connection ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
      {/* Путь соединения - используем polyline вместо path с кривыми Безье */}
      <polyline
        points={pointsString}
        stroke={currentColor}
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
        strokeDasharray={connection.type === 'conditional' ? "5,5" : "none"}
      />

      {/* Стрелка указывающая на целевую точку соединения */}
      <polygon
        points={arrowPoints}
        fill={currentColor}
        stroke="none"
        className="connection-arrow"
      />

      {/* Метка соединения */}
      {connection.label && (
        <text
          x={labelPosition.x}
          y={labelPosition.y}
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
