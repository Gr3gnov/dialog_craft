// src/renderer/contexts/EditorContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GraphService } from '../../services/GraphService';
import { Card } from '../../shared/types/card';
import { Edge } from '../../shared/types/edge';
import { DialogScene } from '../../shared/types/scene';

interface EditorContextType {
  // Состояние
  scene: DialogScene;
  selectedCardId: number | null;
  selectedEdgeId: string | null;
  isModified: boolean;
  currentFilePath: string | null;

  // Методы для работы с карточками
  addCard: (card?: Partial<Card>) => Card;
  updateCard: (id: number, updates: Partial<Card>) => Card;
  deleteCard: (id: number) => void;
  setSelectedCard: (id: number | null) => void;

  // Методы для работы со связями
  addEdge: (source: number, target: number, options?: Partial<Edge>) => Edge;
  updateEdge: (id: string, updates: Partial<Edge>) => Edge;
  deleteEdge: (id: string) => void;
  setSelectedEdge: (id: string | null) => void;

  // Методы для работы со сценой
  setScene: (scene: DialogScene, filePath?: string | null) => void;
  saveScene: () => Promise<boolean>;
  loadScene: () => Promise<boolean>;
  exportToYAML: () => Promise<boolean>;
  importFromYAML: () => Promise<boolean>;

  // Флаги состояния
  setIsModified: (modified: boolean) => void;
}

// Создание контекста
const EditorContext = createContext<EditorContextType | undefined>(undefined);

// Провайдер контекста
interface EditorProviderProps {
  children: ReactNode;
  graphService: GraphService;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children, graphService }) => {
  const [scene, setSceneState] = useState<DialogScene>(graphService.getScene());
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  // Метод для обновления сцены
  const setScene = useCallback((newScene: DialogScene, filePath: string | null = null) => {
    graphService.setScene(newScene);
    setSceneState(newScene);
    setCurrentFilePath(filePath);
    setIsModified(false);
    setSelectedCardId(null);
    setSelectedEdgeId(null);
  }, [graphService]);

  // Методы для работы с карточками
  const addCard = useCallback((card?: Partial<Card>) => {
    const newCard = graphService.addCard(card);
    setSceneState(graphService.getScene());
    setIsModified(true);
    return newCard;
  }, [graphService]);

  const updateCard = useCallback((id: number, updates: Partial<Card>) => {
    const updatedCard = graphService.updateCard(id, updates);
    setSceneState(graphService.getScene());
    setIsModified(true);
    return updatedCard;
  }, [graphService]);

  const deleteCard = useCallback((id: number) => {
    graphService.deleteCard(id);
    setSceneState(graphService.getScene());
    if (selectedCardId === id) {
      setSelectedCardId(null);
    }
    setIsModified(true);
  }, [graphService, selectedCardId]);

  // Методы для работы со связями
  const addEdge = useCallback((source: number, target: number, options?: Partial<Edge>) => {
    const newEdge = graphService.addEdge(source, target, options);
    setSceneState(graphService.getScene());
    setIsModified(true);
    return newEdge;
  }, [graphService]);

  const updateEdge = useCallback((id: string, updates: Partial<Edge>) => {
    const updatedEdge = graphService.updateEdge(id, updates);
    setSceneState(graphService.getScene());
    setIsModified(true);
    return updatedEdge;
  }, [graphService]);

  const deleteEdge = useCallback((id: string) => {
    graphService.deleteEdge(id);
    setSceneState(graphService.getScene());
    if (selectedEdgeId === id) {
      setSelectedEdgeId(null);
    }
    setIsModified(true);
  }, [graphService, selectedEdgeId]);

  // Методы для работы с файлами (заглушки, реализацию добавим позже)
  const saveScene = useCallback(async (): Promise<boolean> => {
    // Заглушка для метода сохранения
    console.log('Saving scene...');
    return true;
  }, []);

  const loadScene = useCallback(async (): Promise<boolean> => {
    // Заглушка для метода загрузки
    console.log('Loading scene...');
    return true;
  }, []);

  const exportToYAML = useCallback(async (): Promise<boolean> => {
    // Заглушка для метода экспорта
    console.log('Exporting to YAML...');
    return true;
  }, []);

  const importFromYAML = useCallback(async (): Promise<boolean> => {
    // Заглушка для метода импорта
    console.log('Importing from YAML...');
    return true;
  }, []);

  // Значение контекста
  const value: EditorContextType = {
    scene,
    selectedCardId,
    selectedEdgeId,
    isModified,
    currentFilePath,

    addCard,
    updateCard,
    deleteCard,
    setSelectedCard: setSelectedCardId,

    addEdge,
    updateEdge,
    deleteEdge,
    setSelectedEdge: setSelectedEdgeId,

    setScene,
    saveScene,
    loadScene,
    exportToYAML,
    importFromYAML,

    setIsModified
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

// Хук для использования контекста
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
