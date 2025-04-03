// src/renderer/components/CardProperties.js
import React, { useState, useEffect } from 'react';
import './CardProperties.css';

// Импортируем ipcRenderer для взаимодействия с основным процессом
const { ipcRenderer } = window.require('electron');

const CardProperties = ({ card, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [type, setType] = useState('character');
  const [characterName, setCharacterName] = useState('');
  const [background, setBackground] = useState('');
  const [portrait, setPortrait] = useState('');
  const [introduceCharacter, setIntroduceCharacter] = useState(false);
  const [pause, setPause] = useState(0);
  const [isNarrator, setIsNarrator] = useState(false);
  const [isThought, setIsThought] = useState(false);

  // Update local state when selected card changes
  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setText(card.text || '');
      setType(card.type || 'character');
      setCharacterName(card.character_name || '');
      setBackground(card.background || '');
      setPortrait(card.portrait || '');
      setIntroduceCharacter(card.introduce_character || false);
      setPause(card.pause || 0);
      setIsNarrator(card.is_narrator || false);
      setIsThought(card.is_thought || false);
    }
  }, [card]);

  // Функция для открытия диалога выбора файла
  const handleFileSelect = async (field) => {
    try {
      const result = await ipcRenderer.invoke('show-file-dialog');
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        if (field === 'portrait') {
          setPortrait(`file://${filePath}`);
        } else if (field === 'background') {
          setBackground(`file://${filePath}`);
        }
      }
    } catch (err) {
      console.error('Error selecting file:', err);
      alert('Failed to select file. Check console for details.');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (card) {
      onUpdate({
        ...card,
        title,
        text,
        type,
        character_name: characterName,
        background,
        portrait,
        introduce_character: introduceCharacter,
        pause,
        is_narrator: isNarrator,
        is_thought: isThought
      });
    }
  };

  // Функция сброса пути к файлу
  const resetFile = (field) => {
    if (field === 'portrait') {
      setPortrait('');
    } else if (field === 'background') {
      setBackground('');
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
      <h3>Dialog Properties</h3>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <h4>Basic Information</h4>
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Dialog title"
            />
          </div>
          <div className="form-group">
            <label htmlFor="id">ID:</label>
            <input
              type="text"
              id="id"
              value={card.id}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="character_name">Character Name:</label>
            <input
              type="text"
              id="character_name"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Character speaking"
            />
          </div>
        </div>

        <div className="field-group">
          <h4>Content</h4>
          <div className="form-group">
            <label htmlFor="text">Dialog Text:</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Enter dialog text here..."
            ></textarea>
          </div>
        </div>

        <div className="field-group">
          <h4>Visual Elements</h4>
          <div className="form-group file-input">
            <label htmlFor="portrait">Portrait:</label>
            <div className="file-input-container">
              <input
                type="text"
                id="portrait"
                value={portrait}
                onChange={(e) => setPortrait(e.target.value)}
                placeholder="Path to portrait image"
                className="file-path"
              />
              <button
                type="button"
                className="browse-button"
                onClick={() => handleFileSelect('portrait')}
              >
                Browse...
              </button>
              <button
                type="button"
                className="reset-button"
                onClick={() => resetFile('portrait')}
              >
                Reset
              </button>
            </div>
          </div>
          <div className="form-group file-input">
            <label htmlFor="background">Background:</label>
            <div className="file-input-container">
              <input
                type="text"
                id="background"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Path to background image"
                className="file-path"
              />
              <button
                type="button"
                className="browse-button"
                onClick={() => handleFileSelect('background')}
              >
                Browse...
              </button>
              <button
                type="button"
                className="reset-button"
                onClick={() => resetFile('background')}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="field-group">
          <h4>Dialog Properties</h4>
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
          <div className="form-group">
            <label htmlFor="pause">Pause (seconds):</label>
            <input
              type="number"
              id="pause"
              value={pause}
              onChange={(e) => setPause(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={introduceCharacter}
                onChange={(e) => setIntroduceCharacter(e.target.checked)}
              />
              Introduce Character
            </label>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isNarrator}
                onChange={(e) => setIsNarrator(e.target.checked)}
              />
              Is Narrator
            </label>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isThought}
                onChange={(e) => setIsThought(e.target.checked)}
              />
              Is Thought
            </label>
          </div>
        </div>

        <button type="submit" className="save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default CardProperties;
