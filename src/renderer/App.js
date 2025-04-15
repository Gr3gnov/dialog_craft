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

  // Toggle connection creation mode
  const handleToggleConnectionMode = () => {
    if (createConnectionMode) {
      // Exit connection mode
      setCreateConnectionMode(false);
      setSourceCardId(null);
    } else {
      // Enter connection mode
      setCreateConnectionMode(true);
      setSelectedConnectionId(null); // Deselect any selected connection
    }
  };

  // Handle card selection
  const handleCardSelect = (cardId) => {
    if (createConnectionMode) {
      if (!sourceCardId) {
        // First card in connection creation process
        setSourceCardId(cardId);
      } else if (sourceCardId !== cardId) {
        // Second card - create connection and exit connection mode
        handleCreateConnection(sourceCardId, cardId);
        setCreateConnectionMode(false);
        setSourceCardId(null);
      }
    } else {
      // Normal card selection
      setSelectedCardId(cardId);
      setSelectedConnectionId(null); // Deselect any selected connection
    }
  };

  // Start connection from a specific card using the connection button
  const handleStartConnection = (cardId) => {
    setSourceCardId(cardId);
    setCreateConnectionMode(true);
  };

  // Handle connection selection
  const handleConnectionSelect = (connectionId) => {
    setSelectedConnectionId(connectionId);
    setSelectedCardId(null); // Deselect any selected card
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
