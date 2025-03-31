// src/services/GraphService.ts
import { Card, CardType } from '../shared/types/card';
import { Edge } from '../shared/types/edge';
import { DialogScene } from '../shared/types/scene';

export class GraphService {
  private scene: DialogScene;
  private nextCardId: number;

  constructor(scene?: DialogScene) {
    this.scene = scene || {
      id: crypto.randomUUID(),
      name: 'Новая сцена',
      cards: [],
      edges: []
    };

    // Определяем следующий доступный ID для карточки
    this.nextCardId = this.scene.cards.length > 0
      ? Math.max(...this.scene.cards.map(card => card.id)) + 1
      : 1;
  }

  // Получение всей сцены
  getScene(): DialogScene {
    return this.scene;
  }

  // Установка сцены
  setScene(scene: DialogScene): void {
    this.scene = scene;
    this.nextCardId = this.scene.cards.length > 0
      ? Math.max(...this.scene.cards.map(card => card.id)) + 1
      : 1;
  }

  // Добавление новой карточки
  addCard(card: Partial<Card> = {}): Card {
    const newCard: Card = {
      id: card.id ?? this.nextCardId++,
      title: card.title ?? 'Новая реплика',
      type: card.type ?? CardType.REPLICA,
      text: card.text ?? '',
      is_narrator: card.is_narrator ?? false,
      is_thought: card.is_thought ?? false,
      position: card.position ?? { x: 0, y: 0 },
      ...card
    };

    // Если указанный ID уже существует, сдвигаем ID всех карточек с большим или равным ID
    if (this.scene.cards.some(c => c.id === newCard.id)) {
      this.shiftCardIds(newCard.id);
    }

    this.scene.cards.push(newCard);
    return newCard;
  }

  // Обновление существующей карточки
  updateCard(id: number, updates: Partial<Card>): Card {
    const cardIndex = this.scene.cards.findIndex(card => card.id === id);
    if (cardIndex === -1) {
      throw new Error(`Карточка с ID ${id} не найдена`);
    }

    // Если ID изменился и новый ID уже существует, сдвигаем ID других карточек
    if (updates.id !== undefined && updates.id !== id &&
        this.scene.cards.some(card => card.id === updates.id)) {
      this.shiftCardIds(updates.id as number);
    }

    this.scene.cards[cardIndex] = {
      ...this.scene.cards[cardIndex],
      ...updates
    };

    // Если ID карточки изменился, обновляем связи
    if (updates.id !== undefined && updates.id !== id) {
      this.updateEdgesAfterCardIdChange(id, updates.id as number);
    }

    return this.scene.cards[cardIndex];
  }

  // Удаление карточки
  deleteCard(id: number): void {
    const cardIndex = this.scene.cards.findIndex(card => card.id === id);
    if (cardIndex === -1) {
      throw new Error(`Карточка с ID ${id} не найдена`);
    }

    // Удаляем карточку
    this.scene.cards.splice(cardIndex, 1);

    // Удаляем все связи, связанные с этой карточкой
    this.scene.edges = this.scene.edges.filter(
      edge => edge.source !== id && edge.target !== id
    );
  }

  // Добавление связи между карточками
  addEdge(source: number, target: number, options: Partial<Edge> = {}): Edge {
    // Проверяем существование исходной и целевой карточек
    if (!this.scene.cards.some(card => card.id === source)) {
      throw new Error(`Исходная карточка с ID ${source} не найдена`);
    }
    if (!this.scene.cards.some(card => card.id === target)) {
      throw new Error(`Целевая карточка с ID ${target} не найдена`);
    }

    const newEdge: Edge = {
      id: options.id ?? `edge_${source}_${target}_${Date.now()}`,
      source,
      target,
      label: options.label,
      type: options.type,
      color: options.color
    };

    this.scene.edges.push(newEdge);
    return newEdge;
  }

  // Обновление существующей связи
  updateEdge(id: string, updates: Partial<Edge>): Edge {
    const edgeIndex = this.scene.edges.findIndex(edge => edge.id === id);
    if (edgeIndex === -1) {
      throw new Error(`Связь с ID ${id} не найдена`);
    }

    this.scene.edges[edgeIndex] = {
      ...this.scene.edges[edgeIndex],
      ...updates
    };

    return this.scene.edges[edgeIndex];
  }

  // Удаление связи
  deleteEdge(id: string): void {
    const edgeIndex = this.scene.edges.findIndex(edge => edge.id === id);
    if (edgeIndex === -1) {
      throw new Error(`Связь с ID ${id} не найдена`);
    }

    this.scene.edges.splice(edgeIndex, 1);
  }

  // Получение всего графа
  getLayout(): { cards: Card[]; edges: Edge[] } {
    return {
      cards: this.scene.cards,
      edges: this.scene.edges
    };
  }

  // Сдвиг ID карточек для обеспечения уникальности
  private shiftCardIds(fromId: number): void {
    // Сортируем карточки по убыванию ID для предотвращения конфликтов при сдвиге
    const cardsToShift = this.scene.cards
      .filter(card => card.id >= fromId)
      .sort((a, b) => b.id - a.id);

    for (const card of cardsToShift) {
      const oldId = card.id;
      const newId = card.id + 1;
      card.id = newId;
      this.updateEdgesAfterCardIdChange(oldId, newId);
    }

    // Обновляем nextCardId, если необходимо
    this.nextCardId = Math.max(...this.scene.cards.map(card => card.id)) + 1;
  }

  // Обновление связей после изменения ID карточки
  private updateEdgesAfterCardIdChange(oldId: number, newId: number): void {
    for (const edge of this.scene.edges) {
      if (edge.source === oldId) {
        edge.source = newId;
      }
      if (edge.target === oldId) {
        edge.target = newId;
      }
    }
  }
}
