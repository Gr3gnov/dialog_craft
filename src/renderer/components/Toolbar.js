// src/renderer/components/Toolbar.js
import React from 'react';
import './Toolbar.css';

const Toolbar = ({ onAddCard, onToggleConnectionMode, createConnectionMode }) => {
  return (
    <div className="toolbar">
      <button
        className="add-card"
        onClick={() => onAddCard('character')}
      >
        Add Character Dialog
      </button>

      <button
        className="add-card narrator"
        onClick={() => onAddCard('narrator')}
      >
        Add Narrator
      </button>

      <button
        className={`connection-toggle ${createConnectionMode ? 'active' : ''}`}
        onClick={onToggleConnectionMode}
      >
        {createConnectionMode ? 'Cancel Connection' : 'Create Connection'}
      </button>
    </div>
  );
};

export default Toolbar;
