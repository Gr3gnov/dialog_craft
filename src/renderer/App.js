// В src/renderer/App.js
import React, { useState, useRef, useEffect } from 'react';
import Canvas from './components/Canvas';
import CardProperties from './components/CardProperties';
import './App.css';

// Импортируем ipcRenderer для коммуникации с main процессом
const { ipcRenderer } = window.require('electron');

function App() {
  const [cards, setCards] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [createConnectionMode, setCreateConnectionMode] = useState(false);
  const [sourceCardId, setSourceCardId] = useState(null);
  const [currentFilePath, setCurrentFilePath] = useState(null); // Путь к текущему файлу
  const nextIdRef = useRef(1); // Счетчик для ID карточек, начиная с 1
  const nextConnectionIdRef = useRef(1); // Счетчик для ID связей

  // Регистрируем обработчики событий системного меню
  useEffect(() => {
    // Обработчик для "New Project"
    const handleNewProjectMenu = () => {
      handleNewProject();
    };

    // Обработчик для "Open"
    const handleOpenProjectMenu = () => {
      handleLoadProject();
    };

    // Обработчик для "Save"
    const handleSaveProjectMenu = () => {
      handleSaveProject();
    };

    // Обработчик для "Save As"
    const handleSaveProjectAsMenu = () => {
      handleSaveProjectAs();
    };

    // Регистрируем слушателей событий
    ipcRenderer.on('menu-new-project', handleNewProjectMenu);
    ipcRenderer.on('menu-open-project', handleOpenProjectMenu);
    ipcRenderer.on('menu-save-project', handleSaveProjectMenu);
    ipcRenderer.on('menu-save-project-as', handleSaveProjectAsMenu);

    // Очищаем слушателей при размонтировании компонента
    return () => {
      ipcRenderer.removeListener('menu-new-project', handleNewProjectMenu);
      ipcRenderer.removeListener('menu-open-project', handleOpenProjectMenu);
      ipcRenderer.removeListener('menu-save-project', handleSaveProjectMenu);
      ipcRenderer.removeListener('menu-save-project-as', handleSaveProjectAsMenu);
    };
  }, [cards, connections, currentFilePath]); // зависимости для корректной работы функций сохранения

  // Get currently selected card
  const selectedCard = cards.find(card => card.id === selectedCardId);

  // Get currently selected connection
  const selectedConnection = connections.find(conn => conn.id === selectedConnectionId);

  // Add a new card
  const handleAddCard = (type, canvasInfo = null) => {
    let position;

    if (canvasInfo) {
      const viewportCenterX = (canvasInfo.viewport.width / 2 - canvasInfo.offset.x) / canvasInfo.scale;
      const viewportCenterY = (canvasInfo.viewport.height / 2 - canvasInfo.offset.y) / canvasInfo.scale;

      position = {
        x: viewportCenterX - 250,
        y: viewportCenterY - 75
      };
    } else {
      position = {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      };
    }

    const newCard = {
      id: nextIdRef.current.toString(),
      title: type === 'narrator' ? 'Narrator' : 'Character',
      text: '',
      type: type,
      position: position
    };

    nextIdRef.current += 1;
    setCards([...cards, newCard]);
    setSelectedCardId(newCard.id);

    if (createConnectionMode) {
      setCreateConnectionMode(false);
      setSourceCardId(null);
    }
  };

  // Update a card
  const handleUpdateCard = (updatedCard) => {
    setCards(cards.map(card =>
      card.id === updatedCard.id ? updatedCard : card
    ));
  };

  // Delete a card
  const handleDeleteCard = (cardId) => {
    const updatedConnections = connections.filter(
      connection => connection.sourceId !== cardId && connection.targetId !== cardId
    );

    const updatedCards = cards.filter(card => card.id !== cardId);

    setConnections(updatedConnections);
    setCards(updatedCards);

    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    }

    if (sourceCardId === cardId) {
      setSourceCardId(null);
      setCreateConnectionMode(false);
    }
  };

  // Toggle connection creation mode
  const handleToggleConnectionMode = () => {
    if (createConnectionMode) {
      setCreateConnectionMode(false);
      setSourceCardId(null);
      console.log('Exiting connection mode');
    } else {
      setCreateConnectionMode(true);
      setSelectedConnectionId(null);
      console.log('Entering connection mode');
    }
  };

  // Handle card selection
  const handleCardSelect = (cardId) => {
    console.log('Card select called with:', cardId);

    if (createConnectionMode) {
      if (cardId === null) {
        console.log('Click on empty area while in connection mode - exiting connection mode');
        setCreateConnectionMode(false);
        setSourceCardId(null);
      } else if (!sourceCardId) {
        console.log('Selected first card in connection:', cardId);
        setSourceCardId(cardId);
      } else if (sourceCardId !== cardId) {
        console.log('Creating connection:', sourceCardId, '->', cardId);
        handleCreateConnection(sourceCardId, cardId);
        setCreateConnectionMode(false);
        setSourceCardId(null);
      }
    } else {
      console.log('Normal card selection:', cardId);
      setSelectedCardId(cardId);
      setSelectedConnectionId(null);
    }
  };

  // Start connection from a specific card using the connection button
  const handleStartConnection = (cardId) => {
    console.log('Starting connection from card:', cardId);
    if (cardId === null) {
      setSourceCardId(null);
      setCreateConnectionMode(false);
      return;
    }

    setSourceCardId(cardId);
    setCreateConnectionMode(true);
  };

  // Create connection between two cards
  const handleCreateConnection = (sourceId, targetId) => {
    const newConnection = {
      id: `connection-${nextConnectionIdRef.current}`,
      sourceId: sourceId,
      targetId: targetId,
      label: '',
      type: 'default'
    };

    nextConnectionIdRef.current += 1;
    setConnections([...connections, newConnection]);
    setSelectedConnectionId(newConnection.id);

    setCreateConnectionMode(false);
    setSourceCardId(null);
  };

  // Update a connection
  const handleUpdateConnection = (updatedConnection) => {
    setConnections(connections.map(connection =>
      connection.id === updatedConnection.id ? updatedConnection : connection
    ));
  };

  // Delete a connection
  const handleDeleteConnection = (connectionId) => {
    setConnections(connections.filter(connection => connection.id !== connectionId));
    if (selectedConnectionId === connectionId) {
      setSelectedConnectionId(null);
    }
  };

  // Handle connection selection
  const handleConnectionSelect = (connectionId) => {
    console.log('Connection selected:', connectionId);
    setSelectedConnectionId(connectionId);
    setSelectedCardId(null);

    if (createConnectionMode) {
      setCreateConnectionMode(false);
      setSourceCardId(null);
    }
  };

  // Сохранение проекта в файл
  const handleSaveProject = async () => {
    try {
      let filePath = currentFilePath;
      if (!filePath) {
        const result = await ipcRenderer.invoke('save-dialog');
        if (result.canceled || !result.filePath) {
          return;
        }
        filePath = result.filePath;
      }

      const projectData = {
        version: '1.0',
        cards,
        connections,
        nextCardId: nextIdRef.current,
        nextConnectionId: nextConnectionIdRef.current,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      const saveResult = await ipcRenderer.invoke('save-file', {
        filePath,
        data: projectData
      });

      if (saveResult.success) {
        setCurrentFilePath(filePath);
        alert('Проект успешно сохранен');
      } else {
        throw new Error(saveResult.error || 'Неизвестная ошибка при сохранении');
      }
    } catch (error) {
      console.error('Ошибка при сохранении проекта:', error);
      alert(`Не удалось сохранить проект: ${error.message}`);
    }
  };

  // Сохранение проекта в новый файл ("Сохранить как...")
  const handleSaveProjectAs = async () => {
    try {
      const result = await ipcRenderer.invoke('save-dialog');
      if (result.canceled || !result.filePath) {
        return;
      }

      const filePath = result.filePath;

      const projectData = {
        version: '1.0',
        cards,
        connections,
        nextCardId: nextIdRef.current,
        nextConnectionId: nextConnectionIdRef.current,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      const saveResult = await ipcRenderer.invoke('save-file', {
        filePath,
        data: projectData
      });

      if (saveResult.success) {
        setCurrentFilePath(filePath);
        alert('Проект успешно сохранен');
      } else {
        throw new Error(saveResult.error || 'Неизвестная ошибка при сохранении');
      }
    } catch (error) {
      console.error('Ошибка при сохранении проекта:', error);
      alert(`Не удалось сохранить проект: ${error.message}`);
    }
  };

  // Загрузка проекта из файла
  const handleLoadProject = async () => {
    try {
      if (cards.length > 0 || connections.length > 0) {
        const shouldSave = window.confirm(
          'Хотите сохранить текущий проект перед загрузкой нового?'
        );

        if (shouldSave) {
          await handleSaveProject();
        }
      }

      const result = await ipcRenderer.invoke('show-file-dialog', {
        properties: ['openFile'],
        filters: [
          { name: 'Dialog Craft Files', extensions: ['dc', 'json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return;
      }

      const filePath = result.filePaths[0];

      const loadResult = await ipcRenderer.invoke('load-file', { filePath });

      if (!loadResult.success) {
        throw new Error(loadResult.error || 'Неизвестная ошибка при загрузке');
      }

      const projectData = loadResult.data;

      setCards(projectData.cards || []);
      setConnections(projectData.connections || []);
      nextIdRef.current = projectData.nextCardId || 1;
      nextConnectionIdRef.current = projectData.nextConnectionId || 1;
      setCurrentFilePath(filePath);

      setSelectedCardId(null);
      setSelectedConnectionId(null);
      setCreateConnectionMode(false);
      setSourceCardId(null);

      alert('Проект успешно загружен');
    } catch (error) {
      console.error('Ошибка при загрузке проекта:', error);
      alert(`Не удалось загрузить проект: ${error.message}`);
    }
  };

  // Создание нового проекта
  const handleNewProject = () => {
    if (cards.length > 0 || connections.length > 0) {
      const shouldSave = window.confirm(
        'Хотите сохранить текущий проект перед созданием нового?'
      );

      if (shouldSave) {
        handleSaveProject();
      }
    }

    setCards([]);
    setConnections([]);
    nextIdRef.current = 1;
    nextConnectionIdRef.current = 1;
    setSelectedCardId(null);
    setSelectedConnectionId(null);
    setCreateConnectionMode(false);
    setSourceCardId(null);
    setCurrentFilePath(null);
  };

  return (
    <div className="app">
      <div className="main-content">
        <Canvas
          cards={cards}
          connections={connections}
          onCardSelect={handleCardSelect}
          selectedCardId={selectedCardId}
          onUpdateCard={handleUpdateCard}
          onConnectionSelect={handleConnectionSelect}
          selectedConnectionId={selectedConnectionId}
          onCreateConnection={handleCreateConnection}
          onStartConnection={handleStartConnection}
          createConnectionMode={createConnectionMode}
          sourceCardId={sourceCardId}
          setSourceCardId={setSourceCardId}
          onDeleteCard={handleDeleteCard}
          onAddCard={handleAddCard}
        />
        <CardProperties
          card={selectedCard}
          connection={selectedConnection}
          onUpdateCard={handleUpdateCard}
          onUpdateConnection={handleUpdateConnection}
          onDeleteConnection={handleDeleteConnection}
        />
      </div>
    </div>
  );
}

export default App;
