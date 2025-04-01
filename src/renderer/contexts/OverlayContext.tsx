// src/renderer/contexts/OverlayContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface OverlayContextType {
  registerOverlay: (id: string, element: HTMLElement) => void;
  unregisterOverlay: (id: string) => void;
  getOverlayContainer: (id: string) => HTMLElement | null;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const OverlayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [overlayContainers, setOverlayContainers] = useState<Record<string, HTMLElement>>({});

  const registerOverlay = (id: string, element: HTMLElement) => {
    setOverlayContainers(prev => ({ ...prev, [id]: element }));
  };

  const unregisterOverlay = (id: string) => {
    setOverlayContainers(prev => {
      const newContainers = { ...prev };
      delete newContainers[id];
      return newContainers;
    });
  };

  const getOverlayContainer = (id: string) => {
    return overlayContainers[id] || null;
  };

  return (
    <OverlayContext.Provider value={{ registerOverlay, unregisterOverlay, getOverlayContainer }}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
};

// Component to render React elements inside Cytoscape overlays
export const NodeOverlay: React.FC<{ nodeId: string; children: ReactNode }> = ({ nodeId, children }) => {
  const { getOverlayContainer } = useOverlay();
  const container = getOverlayContainer(`overlay-${nodeId}`);

  return container ? createPortal(
    <div className="node-overlay-content" style={{
      pointerEvents: 'none', // By default, no pointer events
      position: 'relative',
      width: '100%',
      height: '100%'
    }}>
      {children}
    </div>,
    container
  ) : null;
};
