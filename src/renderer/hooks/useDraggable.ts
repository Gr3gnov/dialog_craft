// src/renderer/hooks/useDraggable.ts
import { useState, useEffect, RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DraggableOptions {
  onDragEnd?: (position: Position) => void;
}

export function useDraggable(
  ref: RefObject<HTMLElement>,
  initialPosition: Position = { x: 0, y: 0 },
  options: DraggableOptions = {}
) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [elementOffset, setElementOffset] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const handleMouseDown = (e: MouseEvent) => {
      // Prevent dragging when clicking on buttons or interactive elements
      if ((e.target as HTMLElement).closest('.edge-connector-button') ||
          (e.target as HTMLElement).closest('.card-entry-point') ||
          (e.target as HTMLElement).closest('.card-exit-point')) {
        return;
      }

      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      setElementOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });

      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - elementOffset.x;
      const newY = e.clientY - elementOffset.y;

      setPosition({ x: newX, y: newY });

      // Update element position
      element.style.transform = `translate(${newX}px, ${newY}px)`;
      e.preventDefault();
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        if (options.onDragEnd) {
          options.onDragEnd(position);
        }
      }
    };

    // Set initial position
    element.style.transform = `translate(${position.x}px, ${position.y}px)`;

    // Add event listeners
    element.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      // Clean up
      element.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [ref, isDragging, position, startPos, elementOffset, options]);

  return { position, isDragging };
}
