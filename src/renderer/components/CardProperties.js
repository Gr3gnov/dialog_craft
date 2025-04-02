// src/renderer/components/CardProperties.js
import React, { useState, useEffect } from 'react';
import './CardProperties.css';

const CardProperties = ({ card, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [type, setType] = useState('character');

  // Update local state when selected card changes
  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setText(card.text || '');
      setType(card.type || 'character');
    }
  }, [card]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (card) {
      onUpdate({
        ...card,
        title,
        text,
        type
      });
    }
  };

  if (!card) {
    return (
      <div className="card-properties">
        <div className="no-selection">Select a card to edit its properties</div>
      </div>
    );
  }

  return (
    <div className="card-properties">
      <h3>Card Properties</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="text">Text:</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="character">Character</option>
            <option value="narrator">Narrator</option>
          </select>
        </div>
        <button type="submit" className="save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default CardProperties;
