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

  // Обновление формы при изменении выбранной карточки
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

  // Обновление формы при изменении выбранной связи
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

  // Обработчик изменения поля карточки
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Обработка чекбоксов
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setCardFormData({ ...cardFormData, [name]: checkbox.checked });
    } else {
      setCardFormData({ ...cardFormData, [name]: value });
    }
  };

  // Обработчик изменения поля связи
  const handleEdgeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEdgeFormData({ ...edgeFormData, [name]: value });
  };

  // Сохранение изменений карточки
  const handleSaveCard = () => {
    if (editor.selectedCardId !== null && cardFormData.id !== undefined) {
      editor.updateCard(editor.selectedCardId, cardFormData);
    }
  };

  // Сохранение изменений связи
  const handleSaveEdge = () => {
    if (editor.selectedEdgeId !== null && edgeFormData.id !== undefined) {
      editor.updateEdge(editor.selectedEdgeId, edgeFormData);
    }
  };

  // Удаление карточки
  const handleDeleteCard = () => {
    if (editor.selectedCardId !== null) {
      if (window.confirm('Вы уверены, что хотите удалить эту карточку?')) {
        editor.deleteCard(editor.selectedCardId);
      }
    }
  };

  // Удаление связи
  const handleDeleteEdge = () => {
    if (editor.selectedEdgeId !== null) {
      if (window.confirm('Вы уверены, что хотите удалить эту связь?')) {
        editor.deleteEdge(editor.selectedEdgeId);
      }
    }
  };

  // Рендеринг формы для карточки
  const renderCardForm = () => {
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleSaveCard(); }}>
        <h3>Свойства карточки</h3>

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
          <label htmlFor="title">Название:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={cardFormData.title || ''}
            onChange={handleCardInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="text">Текст:</label>
          <textarea
            id="text"
            name="text"
            value={cardFormData.text || ''}
            onChange={handleCardInputChange}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="character_name">Имя персонажа:</label>
          <input
            type="text"
            id="character_name"
            name="character_name"
            value={cardFormData.character_name || ''}
            onChange={handleCardInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="background">Фон:</label>
          <input
            type="text"
            id="background"
            name="background"
            value={cardFormData.background || ''}
            onChange={handleCardInputChange}
          />
          <button type="button" className="browse-button">Обзор...</button>
        </div>

        <div className="form-group">
          <label htmlFor="portrait">Портрет:</label>
          <input
            type="text"
            id="portrait"
            name="portrait"
            value={cardFormData.portrait || ''}
            onChange={handleCardInputChange}
          />
          <button type="button" className="browse-button">Обзор...</button>
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="introduce_character"
            name="introduce_character"
            checked={cardFormData.introduce_character || false}
            onChange={handleCardInputChange}
          />
          <label htmlFor="introduce_character">Представить персонажа</label>
        </div>

        <div className="form-group">
          <label htmlFor="pause">Пауза (сек):</label>
          <input
            type="number"
            id="pause"
            name="pause"
            step="0.1"
            min="0"
            value={cardFormData.pause || ''}
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
          <label htmlFor="is_narrator">Рассказчик</label>
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="is_thought"
            name="is_thought"
            checked={cardFormData.is_thought || false}
            onChange={handleCardInputChange}
          />
          <label htmlFor="is_thought">Мысль</label>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">Сохранить</button>
          <button type="button" className="delete-button" onClick={handleDeleteCard}>Удалить</button>
        </div>
      </form>
    );
  };

  // Рендеринг формы для связи
  const renderEdgeForm = () => {
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleSaveEdge(); }}>
        <h3>Свойства связи</h3>

        <div className="form-group">
          <label htmlFor="label">Название:</label>
          <input
            type="text"
            id="label"
            name="label"
            value={edgeFormData.label || ''}
            onChange={handleEdgeInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Тип:</label>
          <select
            id="type"
            name="type"
            value={edgeFormData.type || 'normal'}
            onChange={handleEdgeInputChange}
          >
            <option value="normal">Обычный</option>
            <option value="success">Успех</option>
            <option value="failure">Неудача</option>
            <option value="special">Специальный</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="color">Цвет:</label>
          <input
            type="color"
            id="color"
            name="color"
            value={edgeFormData.color || '#cccccc'}
            onChange={handleEdgeInputChange}
          />
        </div>

        <div className="form-group">
          <label>Источник:</label>
          <span className="read-only-value">
            {edgeFormData.source !== undefined ? `Карточка #${edgeFormData.source}` : ''}
          </span>
        </div>

        <div className="form-group">
          <label>Цель:</label>
          <span className="read-only-value">
            {edgeFormData.target !== undefined ? `Карточка #${edgeFormData.target}` : ''}
          </span>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">Сохранить</button>
          <button type="button" className="delete-button" onClick={handleDeleteEdge}>Удалить</button>
        </div>
      </form>
    );
  };

  // Рендеринг компонента
  return (
    <div className="property-panel">
      {editor.selectedCardId !== null ? (
        renderCardForm()
      ) : editor.selectedEdgeId !== null ? (
        renderEdgeForm()
      ) : (
        <div className="no-selection">
          <p>Выберите карточку или связь для редактирования свойств</p>
        </div>
      )}
    </div>
  );
};
