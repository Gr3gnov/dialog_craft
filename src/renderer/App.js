// В src/renderer/App.js
import React, { useState, useRef } from 'react';
import Canvas from './components/Canvas';
import CardProperties from './components/CardProperties';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  const [cards, setCards] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [createConnectionMode, setCreateConnectionMode] = useState(false);
  const [sourceCardId, setSourceCardId] = useState(null);
  const nextIdRef = useRef(1); // Счетчик для ID карточек, начиная с 1
  const nextConnectionIdRef = useRef(1); // Счетчик для ID связей

  // Get currently selected card
  const selectedCard = cards.find(card => card.id === selectedCardId);

  // Get currently selected connection
  const selectedConnection = connections.find(conn => conn.id === selectedConnectionId);

  // Add a new card
  const handleAddCard = (type) => {
    const newCard = {
      id: nextIdRef.current.toString(), // Используем текущее значение счетчика
      title: type === 'narrator' ? 'Narrator' : 'Character',
      text: '',
      type: type,
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      }
    };

    nextIdRef.current += 1; // Увеличиваем счетчик для следующей карточки
    setCards([...cards, newCard]);
    setSelectedCardId(newCard.id);

    // Exit connection mode if active
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
    // Удаляем все соединения, связанные с этой карточкой
    const updatedConnections = connections.filter(
      connection => connection.sourceId !== cardId && connection.targetId !== cardId
    );

    // Удаляем карточку
    const updatedCards = cards.filter(card => card.id !== cardId);

    // Обновляем состояния
    setConnections(updatedConnections);
    setCards(updatedCards);

    // Если была удалена выбранная карточка, сбрасываем выбор
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    }

    // Если в режиме создания соединения была выбрана эта карточка, выходим из режима
    if (sourceCardId === cardId) {
      setSourceCardId(null);
      setCreateConnectionMode(false);
    }
  };

  // Toggle connection creation mode
  const handleToggleConnectionMode = () => {
    if (createConnectionMode) {
      // Exit connection mode
      setCreateConnectionMode(false);
      setSourceCardId(null);
      console.log('Exiting connection mode from toolbar');
    } else {
      // Enter connection mode
      setCreateConnectionMode(true);
      setSelectedConnectionId(null); // Deselect any selected connection
      console.log('Entering connection mode from toolbar');
    }
  };

  // Handle card selection
  const handleCardSelect = (cardId) => {
    console.log('Card select called with:', cardId);

    if (createConnectionMode) {
      if (cardId === null) {
        // Клик по пустому месту в режиме создания связей - выходим из режима
        console.log('Click on empty area while in connection mode - exiting connection mode');
        setCreateConnectionMode(false);
        setSourceCardId(null);
      } else if (!sourceCardId) {
        // First card in connection creation process
        console.log('Selected first card in connection:', cardId);
        setSourceCardId(cardId);
      } else if (sourceCardId !== cardId) {
        // Second card - create connection and exit connection mode
        console.log('Creating connection:', sourceCardId, '->', cardId);
        handleCreateConnection(sourceCardId, cardId);
        setCreateConnectionMode(false);
        setSourceCardId(null);
      }
    } else {
      // Normal card selection
      console.log('Normal card selection:', cardId);
      setSelectedCardId(cardId);
      setSelectedConnectionId(null); // Deselect any selected connection
    }
  };

  // Start connection from a specific card using the connection button
  const handleStartConnection = (cardId) => {
    console.log('Starting connection from card:', cardId);
    // Если передан null, значит отключаем режим связи
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
      label: '', // Empty label by default
      type: 'default' // Default connection type
    };

    nextConnectionIdRef.current += 1;
    setConnections([...connections, newConnection]);
    setSelectedConnectionId(newConnection.id);

    // Always exit connection mode after creating a connection
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
    setSelectedCardId(null); // Deselect any selected card

    // Также выходим из режима создания связи, если он был активен
    if (createConnectionMode) {
      setCreateConnectionMode(false);
      setSourceCardId(null);
    }
  };

  return (
    <div className="app">
      <Toolbar
        onAddCard={handleAddCard}
        onToggleConnectionMode={handleToggleConnectionMode}
        createConnectionMode={createConnectionMode}
      />
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
