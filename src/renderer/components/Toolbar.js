// src/renderer/components/Toolbar.js
import React from 'react';
import './Toolbar.css';

const Toolbar = ({ onAddCard }) => {
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
        Add Narrator Dialog
      </button>
    </div>
  );
};

export default Toolbar;
