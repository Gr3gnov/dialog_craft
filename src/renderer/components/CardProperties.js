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

  // Автосохранение - функции обработчики изменений
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    saveChanges({ title: newTitle });
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    saveChanges({ text: newText });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    saveChanges({ type: newType });
  };

  const handleCharacterNameChange = (e) => {
    const newName = e.target.value;
    setCharacterName(newName);
    saveChanges({ character_name: newName });
  };

  const handleBackgroundChange = (e) => {
    const newBackground = e.target.value;
    setBackground(newBackground);
    saveChanges({ background: newBackground });
  };

  const handlePortraitChange = (e) => {
    const newPortrait = e.target.value;
    setPortrait(newPortrait);
    saveChanges({ portrait: newPortrait });
  };

  const handleIntroduceCharacterChange = (e) => {
    const newIntroduce = e.target.checked;
    setIntroduceCharacter(newIntroduce);
    saveChanges({ introduce_character: newIntroduce });
  };

  const handlePauseChange = (e) => {
    const newPause = parseFloat(e.target.value) || 0;
    setPause(newPause);
    saveChanges({ pause: newPause });
  };

  const handleIsNarratorChange = (e) => {
    const newIsNarrator = e.target.checked;
    setIsNarrator(newIsNarrator);
    saveChanges({ is_narrator: newIsNarrator });
  };

  const handleIsThoughtChange = (e) => {
    const newIsThought = e.target.checked;
    setIsThought(newIsThought);
    saveChanges({ is_thought: newIsThought });
  };

  // Функция для открытия диалога выбора файла
  const handleFileSelect = async (field) => {
    try {
      const result = await ipcRenderer.invoke('show-file-dialog');
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        if (field === 'portrait') {
          setPortrait(`file://${filePath}`);
          saveChanges({ portrait: `file://${filePath}` });
        } else if (field === 'background') {
          setBackground(`file://${filePath}`);
          saveChanges({ background: `file://${filePath}` });
        }
      }
    } catch (err) {
      console.error('Error selecting file:', err);
      alert('Failed to select file. Check console for details.');
    }
  };

  // Вспомогательная функция для сохранения изменений
  const saveChanges = (changes) => {
    if (card) {
      onUpdate({
        ...card,
        ...changes
      });
    }
  };

  // Функция сброса пути к файлу
  const resetFile = (field) => {
    if (field === 'portrait') {
      setPortrait('');
      saveChanges({ portrait: '' });
    } else if (field === 'background') {
      setBackground('');
      saveChanges({ background: '' });
    }
  };

  // Handle form submission - больше не нужна, так как используем автосохранение
  const handleSubmit = (e) => {
    e.preventDefault();
    // Оставляем для совместимости, но она уже не нужна
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
              onChange={handleTitleChange}
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
              onChange={handleCharacterNameChange}
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
              onChange={handleTextChange}
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
                onChange={handlePortraitChange}
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
                onChange={handleBackgroundChange}
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
              onChange={handleTypeChange}
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
              onChange={handlePauseChange}
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={introduceCharacter}
                onChange={handleIntroduceCharacterChange}
              />
              Introduce Character
            </label>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isNarrator}
                onChange={handleIsNarratorChange}
              />
              Is Narrator
            </label>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isThought}
                onChange={handleIsThoughtChange}
              />
              Is Thought
            </label>
          </div>
        </div>

        {/* Кнопка теперь не нужна из-за автосохранения, но можно оставить для удобства пользователя */}
        <button type="submit" className="save-button">
          Apply Changes
        </button>
      </form>
    </div>
  );
};

export default CardProperties;
