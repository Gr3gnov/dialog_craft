// src/renderer/components/PropertyPanel/PropertyPanel.tsx
import React, { useState, useEffect } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { Card } from '../../../shared/types/card';
import { Edge } from '../../../shared/types/edge';
import './PropertyPanel.css';

export const PropertyPanel: React.FC = () => {
  const editor = useEditor();
  const [cardFormData, setCardFormData] = useState<Partial<Card>>({});
  const [edgeFormData, setEdgeFormData] = useState<Partial<Edge>>({});

  // Update form when selected card changes
  useEffect(() => {
    if (editor.selectedCardId !== null) {
      const selectedCard = editor.scene.cards.find(card => card.id === editor.selectedCardId);
      if (selectedCard) {
        setCardFormData({ ...selectedCard });
      }
    } else {
      setCardFormData({});
    }
  }, [editor.selectedCardId, editor.scene.cards]);

  // Update form when selected edge changes
  useEffect(() => {
    if (editor.selectedEdgeId !== null) {
      const selectedEdge = editor.scene.edges.find(edge => edge.id === editor.selectedEdgeId);
      if (selectedEdge) {
        setEdgeFormData({ ...selectedEdge });
      }
    } else {
      setEdgeFormData({});
    }
  }, [editor.selectedEdgeId, editor.scene.edges]);

  // Handle card input changes
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Handle checkboxes
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setCardFormData({ ...cardFormData, [name]: checkbox.checked });
    } else {
      setCardFormData({ ...cardFormData, [name]: value });
    }
  };

  // Handle edge input changes
  const handleEdgeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEdgeFormData({ ...edgeFormData, [name]: value });
  };

  // Save card changes
  const handleSaveCard = () => {
    if (editor.selectedCardId !== null && cardFormData.id !== undefined) {
      editor.updateCard(editor.selectedCardId, cardFormData);
    }
  };

  // Save edge changes
  const handleSaveEdge = () => {
    if (editor.selectedEdgeId !== null && edgeFormData.id !== undefined) {
      editor.updateEdge(editor.selectedEdgeId, edgeFormData);
    }
  };

  // Delete card
  const handleDeleteCard = () => {
    if (editor.selectedCardId !== null) {
      if (window.confirm('Are you sure you want to delete this card?')) {
        editor.deleteCard(editor.selectedCardId);
      }
    }
  };

  // Delete edge
  const handleDeleteEdge = () => {
    if (editor.selectedEdgeId !== null) {
      if (window.confirm('Are you sure you want to delete this edge?')) {
        editor.deleteEdge(editor.selectedEdgeId);
      }
    }
  };

  // Render card form
  const renderCardForm = () => {
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleSaveCard(); }}>
        <h3>Card Properties</h3>

        <div className="form-group">
          <label htmlFor="id">ID:</label>
          <input
            type="number"
            id="id"
            name="id"
            value={cardFormData.id || ''}
            onChange={handleCardInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={cardFormData.title || ''}
            onChange={handleCardInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="text">Text:</label>
          <textarea
            id="text"
            name="text"
            value={cardFormData.text || ''}
            onChange={handleCardInputChange}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="character_name">Character Name:</label>
          <input
            type="text"
            id="character_name"
            name="character_name"
            value={cardFormData.character_name || ''}
            onChange={handleCardInputChange}
          />
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="is_narrator"
            name="is_narrator"
            checked={cardFormData.is_narrator || false}
            onChange={handleCardInputChange}
          />
          <label htmlFor="is_narrator">Narrator</label>
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="is_thought"
            name="is_thought"
            checked={cardFormData.is_thought || false}
            onChange={handleCardInputChange}
          />
          <label htmlFor="is_thought">Thought</label>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">Save</button>
          <button type="button" className="delete-button" onClick={handleDeleteCard}>Delete</button>
        </div>
      </form>
    );
  };

  // Render edge form
  const renderEdgeForm = () => {
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleSaveEdge(); }}>
        <h3>Edge Properties</h3>

        <div className="form-group">
          <label htmlFor="label">Label:</label>
          <input
            type="text"
            id="label"
            name="label"
            value={edgeFormData.label || ''}
            onChange={handleEdgeInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            name="type"
            value={edgeFormData.type || 'normal'}
            onChange={handleEdgeInputChange}
          >
            <option value="normal">Normal</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="special">Special</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="color">Color:</label>
          <input
            type="color"
            id="color"
            name="color"
            value={edgeFormData.color || '#cccccc'}
            onChange={handleEdgeInputChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">Save</button>
          <button type="button" className="delete-button" onClick={handleDeleteEdge}>Delete</button>
        </div>
      </form>
    );
  };

  return (
    <div className="property-panel">
      {editor.selectedCardId !== null ? (
        renderCardForm()
      ) : editor.selectedEdgeId !== null ? (
        renderEdgeForm()
      ) : (
        <div className="no-selection">
          <p>Select a card or edge to edit properties</p>
        </div>
      )}
    </div>
  );
};
