// src/renderer/App.js
import React, { useState } from 'react';
import Canvas from './components/Canvas';
import CardProperties from './components/CardProperties';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Get currently selected card
  const selectedCard = cards.find(card => card.id === selectedCardId);

  // Add a new card
  const handleAddCard = (type) => {
    const newCard = {
      id: Date.now().toString(),
      title: type === 'narrator' ? 'Narrator' : 'Character',
      text: '',
      type: type,
      position: {
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100
      }
    };

    setCards([...cards, newCard]);
    setSelectedCardId(newCard.id);
  };

  // Update a card
  const handleUpdateCard = (updatedCard) => {
    console.log('Updating card:', updatedCard);
    setCards(cards.map(card =>
      card.id === updatedCard.id ? updatedCard : card
    ));
  };

  return (
    <div className="app">
      <Toolbar onAddCard={handleAddCard} />
      <div className="main-content">
        <Canvas
          cards={cards}
          onCardSelect={setSelectedCardId}
          selectedCardId={selectedCardId}
          onUpdateCard={handleUpdateCard}
        />
        <CardProperties
          card={selectedCard}
          onUpdate={handleUpdateCard}
        />
      </div>
    </div>
  );
}

export default App;
