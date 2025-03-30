import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import GraphService from '../../services/GraphService';
import { Card, Edge, DialogScene } from '../../shared/types';

interface EditorContextType {
  graphService: GraphService;
  scene: DialogScene;
  selectedCardId: number | null;
  selectedEdgeId: string | null;
  isModified: boolean;
  currentFilePath: string | null;
  setSelectedCardId: (id: number | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  createCard: (card: Partial<Card>) => Card;
  updateCard: (id: number, updates: Partial<Card>) => Card;
  deleteCard: (id: number) => void;
  createEdge: (source: number, target: number, options?: Partial<Edge>) => Edge;
  updateEdge: (id: string, updates: Partial<Edge>) => Edge;
  deleteEdge: (id: string) => void;
  loadScene: (scene: DialogScene) => void;
  setCurrentFilePath: (path: string | null) => void;
  markAsModified: (modified?: boolean) => void;
}

const defaultScene: DialogScene = {
  id: 'new-scene',
  name: 'Новая сцена',
  cards: [],
  edges: []
};

export const EditorContext = createContext<EditorContextType | undefined>(undefined);

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [graphService] = useState<GraphService>(() => new GraphService());
  const [scene, setScene] = useState<DialogScene>(defaultScene);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  // Инициализация сцены при загрузке
  useEffect(() => {
    updateSceneFromService();
  }, []);

  // Обновление сцены из сервиса
  const updateSceneFromService = () => {
    const { cards, edges } = graphService.getLayout();
    setScene(prev => ({
      ...prev,
      cards,
      edges
    }));
  };

  // Функции для работы с карточками
  const createCard = (card: Partial<Card>): Card => {
    const newCard = graphService.addCard(card);
    updateSceneFromService();
    setIsModified(true);
    return newCard;
  };

  const updateCard = (id: number, updates: Partial<Card>): Card => {
    const updatedCard = graphService.updateCard(id, updates);
    updateSceneFromService();
    setIsModified(true);
    return updatedCard;
  };

  const deleteCard = (id: number): void => {
    graphService.deleteCard(id);
    if (selectedCardId === id) {
      setSelectedCardId(null);
    }
    updateSceneFromService();
    setIsModified(true);
  };

  // Функции для работы со связями
  const createEdge = (source: number, target: number, options?: Partial<Edge>): Edge => {
    const newEdge = graphService.addEdge(source, target, options);
    updateSceneFromService();
    setIsModified(true);
    return newEdge;
  };

  const updateEdge = (id: string, updates: Partial<Edge>): Edge => {
    const updatedEdge = graphService.updateEdge(id, updates);
    updateSceneFromService();
    setIsModified(true);
    return updatedEdge;
  };

  const deleteEdge = (id: string): void => {
    graphService.deleteEdge(id);
    if (selectedEdgeId === id) {
      setSelectedEdgeId(null);
    }
    updateSceneFromService();
    setIsModified(true);
  };

  // Загрузка сцены
  const loadScene = (newScene: DialogScene): void => {
    // Создаем новый экземпляр GraphService для загрузки сцены
    const newGraphService = new GraphService();
    
    // Находим максимальный ID карточки для настройки nextCardId
    if (newScene.cards.length > 0) {
      const maxId = Math.max(...newScene.cards.map(card => card.id));
      newGraphService.setNextCardId(maxId + 1);
    }

    // Загружаем карточки
    newScene.cards.forEach(card => {
      newGraphService.addCard(card);
    });

    // Загружаем связи
    newScene.edges.forEach(edge => {
      newGraphService.addEdge(edge.source, edge.target, edge);
    });

    // Обновляем контекст
    setScene(newScene);
    setSelectedCardId(null);
    setSelectedEdgeId(null);
    setIsModified(false);
  };

  const markAsModified = (modified: boolean = true): void => {
    setIsModified(modified);
  };

  const contextValue: EditorContextType = {
    graphService,
    scene,
    selectedCardId,
    selectedEdgeId,
    isModified,
    currentFilePath,
    setSelectedCardId,
    setSelectedEdgeId,
    createCard,
    updateCard,
    deleteCard,
    createEdge,
    updateEdge,
    deleteEdge,
    loadScene,
    setCurrentFilePath,
    markAsModified
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// Хук для использования контекста
export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
