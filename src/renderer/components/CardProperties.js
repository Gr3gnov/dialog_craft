// src/renderer/components/CardProperties.js
import React, { useState, useEffect } from 'react';
import './CardProperties.css';

// Импортируем ipcRenderer для взаимодействия с основным процессом
const { ipcRenderer } = window.require('electron');

const CardProperties = ({ card, connection, onUpdateCard, onUpdateConnection, onDeleteConnection }) => {
  // Card state
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

  // Connection state
  const [connectionLabel, setConnectionLabel] = useState('');
  const [connectionType, setConnectionType] = useState('default');
  const [connectionPriority, setConnectionPriority] = useState(0);
  const [connectionCondition, setConnectionCondition] = useState('');

  // Update card state when selected card changes
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

  // Update connection state when selected connection changes
  useEffect(() => {
    if (connection) {
      setConnectionLabel(connection.label || '');
      setConnectionType(connection.type || 'default');
      setConnectionPriority(connection.priority || 0);
      setConnectionCondition(connection.condition || '');
    }
  }, [connection]);

  // Card autosave functions
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    saveCardChanges({ title: newTitle });
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    saveCardChanges({ text: newText });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    saveCardChanges({ type: newType });
  };

  const handleCharacterNameChange = (e) => {
    const newName = e.target.value;
    setCharacterName(newName);
    saveCardChanges({ character_name: newName });
  };

  const handleBackgroundChange = (e) => {
    const newBackground = e.target.value;
    setBackground(newBackground);
    saveCardChanges({ background: newBackground });
  };

  const handlePortraitChange = (e) => {
    const newPortrait = e.target.value;
    setPortrait(newPortrait);
    saveCardChanges({ portrait: newPortrait });
  };

  const handleIntroduceCharacterChange = (e) => {
    const newIntroduce = e.target.checked;
    setIntroduceCharacter(newIntroduce);
    saveCardChanges({ introduce_character: newIntroduce });
  };

  const handlePauseChange = (e) => {
    const newPause = parseFloat(e.target.value) || 0;
    setPause(newPause);
    saveCardChanges({ pause: newPause });
  };

  const handleIsNarratorChange = (e) => {
    const newIsNarrator = e.target.checked;
    setIsNarrator(newIsNarrator);
    saveCardChanges({ is_narrator: newIsNarrator });
  };

  const handleIsThoughtChange = (e) => {
    const newIsThought = e.target.checked;
    setIsThought(newIsThought);
    saveCardChanges({ is_thought: newIsThought });
  };

  // Connection autosave functions
  const handleConnectionLabelChange = (e) => {
    const newLabel = e.target.value;
    setConnectionLabel(newLabel);
    saveConnectionChanges({ label: newLabel });
  };

  const handleConnectionTypeChange = (e) => {
    const newType = e.target.value;
    setConnectionType(newType);
    saveConnectionChanges({ type: newType });
  };

  const handleConnectionPriorityChange = (e) => {
    const newPriority = parseInt(e.target.value) || 0;
    setConnectionPriority(newPriority);
    saveConnectionChanges({ priority: newPriority });
  };

  const handleConnectionConditionChange = (e) => {
    const newCondition = e.target.value;
    setConnectionCondition(newCondition);
    saveConnectionChanges({ condition: newCondition });
  };

  const handleDeleteConnection = () => {
    if (connection && window.confirm("Are you sure you want to delete this connection?")) {
      onDeleteConnection(connection.id);
    }
  };

  // Functions for file selection
  const handleFileSelect = async (field) => {
    try {
      const result = await ipcRenderer.invoke('show-file-dialog');
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        if (field === 'portrait') {
          setPortrait(`file://${filePath}`);
          saveCardChanges({ portrait: `file://${filePath}` });
        } else if (field === 'background') {
          setBackground(`file://${filePath}`);
          saveCardChanges({ background: `file://${filePath}` });
        }
      }
    } catch (err) {
      console.error('Error selecting file:', err);
      alert('Failed to select file. Check console for details.');
    }
  };

  // Helper function to save card changes
  const saveCardChanges = (changes) => {
    if (card) {
      onUpdateCard({
        ...card,
        ...changes
      });
    }
  };

  // Helper function to save connection changes
  const saveConnectionChanges = (changes) => {
    if (connection) {
      onUpdateConnection({
        ...connection,
        ...changes
      });
    }
  };

  // Function to reset file paths
  const resetFile = (field) => {
    if (field === 'portrait') {
      setPortrait('');
      saveCardChanges({ portrait: '' });
    } else if (field === 'background') {
      setBackground('');
      saveCardChanges({ background: '' });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Not needed due to autosave, but kept for compatibility
  };

  // If nothing is selected
  if (!card && !connection) {
    return (
      <div className="card-properties">
        <div className="no-selection">Select a card or connection to edit its properties</div>
      </div>
    );
  }

  // If a card is selected
  if (card) {
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

          {/* Button isn't needed for autosave but kept for UX */}
          <button type="submit" className="save-button">
            Apply Changes
          </button>
        </form>
      </div>
    );
  }

  // If a connection is selected
  return (
    <div className="card-properties">
      <h3>Connection Properties</h3>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <h4>Basic Information</h4>
          <div className="form-group">
            <label htmlFor="id">ID:</label>
            <input
              type="text"
              id="id"
              value={connection.id}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="source">From:</label>
            <input
              type="text"
              id="source"
              value={connection.sourceId}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="target">To:</label>
            <input
              type="text"
              id="target"
              value={connection.targetId}
              disabled
            />
          </div>
        </div>

        <div className="field-group">
          <h4>Connection Properties</h4>
          <div className="form-group">
            <label htmlFor="label">Label:</label>
            <input
              type="text"
              id="label"
              value={connectionLabel}
              onChange={handleConnectionLabelChange}
              placeholder="Connection label"
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              value={connectionType}
              onChange={handleConnectionTypeChange}
            >
              <option value="default">Default</option>
              <option value="conditional">Conditional</option>
              <option value="alternative">Alternative</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priority:</label>
            <input
              type="number"
              id="priority"
              value={connectionPriority}
              onChange={handleConnectionPriorityChange}
              min="0"
              step="1"
            />
          </div>
          {connectionType === 'conditional' && (
            <div className="form-group">
              <label htmlFor="condition">Condition:</label>
              <textarea
                id="condition"
                value={connectionCondition}
                onChange={handleConnectionConditionChange}
                rows={3}
                placeholder="Enter condition..."
              ></textarea>
            </div>
          )}
        </div>

        <button
          type="button"
          className="delete-button"
          onClick={handleDeleteConnection}
        >
          Delete Connection
        </button>
      </form>
    </div>
  );
};

export default CardProperties;
