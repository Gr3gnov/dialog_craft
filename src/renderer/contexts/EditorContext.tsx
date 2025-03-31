// src/renderer/contexts/EditorContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GraphService } from '../../services/GraphService';
import { Card } from '../../shared/types/card';
import { Edge } from '../../shared/types/edge';
import { DialogScene } from '../../shared/types/scene';

interface EditorContextType {
  scene: DialogScene;
  selectedCardId: number | null;
  selectedEdgeId: string | null;

  addCard: (card?: Partial<Card>) => Card;
  updateCard: (id: number, updates: Partial<Card>) => Card;
  deleteCard: (id: number) => void;
  setSelectedCard: (id: number | null) => void;

  addEdge: (source: number, target: number, options?: Partial<Edge>) => Edge;
  updateEdge: (id: string, updates: Partial<Edge>) => Edge;
  deleteEdge: (id: string) => void;
  setSelectedEdge: (id: string | null) => void;

  setScene: (scene: DialogScene) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode; graphService: GraphService }> = ({
  children,
  graphService
}) => {
  const [scene, setSceneState] = useState<DialogScene>(graphService.getScene());
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const setScene = useCallback((newScene: DialogScene) => {
    graphService.setScene(newScene);
    setSceneState(newScene);
    setSelectedCardId(null);
    setSelectedEdgeId(null);
  }, [graphService]);

  const addCard = useCallback((card?: Partial<Card>) => {
    const newCard = graphService.addCard(card);
    setSceneState(graphService.getScene());
    return newCard;
  }, [graphService]);

  const updateCard = useCallback((id: number, updates: Partial<Card>) => {
    const updatedCard = graphService.updateCard(id, updates);
    setSceneState(graphService.getScene());
    return updatedCard;
  }, [graphService]);

  const deleteCard = useCallback((id: number) => {
    graphService.deleteCard(id);
    setSceneState(graphService.getScene());
    if (selectedCardId === id) {
      setSelectedCardId(null);
    }
  }, [graphService, selectedCardId]);

  const addEdge = useCallback((source: number, target: number, options?: Partial<Edge>) => {
    const newEdge = graphService.addEdge(source, target, options);
    setSceneState(graphService.getScene());
    return newEdge;
  }, [graphService]);

  const updateEdge = useCallback((id: string, updates: Partial<Edge>) => {
    const updatedEdge = graphService.updateEdge(id, updates);
    setSceneState(graphService.getScene());
    return updatedEdge;
  }, [graphService]);

  const deleteEdge = useCallback((id: string) => {
    graphService.deleteEdge(id);
    setSceneState(graphService.getScene());
    if (selectedEdgeId === id) {
      setSelectedEdgeId(null);
    }
  }, [graphService, selectedEdgeId]);

  const value: EditorContextType = {
    scene,
    selectedCardId,
    selectedEdgeId,

    addCard,
    updateCard,
    deleteCard,
    setSelectedCard: setSelectedCardId,

    addEdge,
    updateEdge,
    deleteEdge,
    setSelectedEdge: setSelectedEdgeId,

    setScene
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
