import { Card, Edge, CardType } from '../shared/types';

class GraphService {
  private cards: Card[] = [];
  private edges: Edge[] = [];
  private nextCardId = 1;

  constructor() {}

  // Методы для работы с карточками
  public addCard(card: Partial<Card>): Card {
    const newCard: Card = {
      id: this.getNextCardId(),
      title: card.title || 'Новая реплика',
      type: card.type || CardType.REPLICA,
      text: card.text || '',
      is_narrator: card.is_narrator || false,
      is_thought: card.is_thought || false,
      position: card.position || { x: 0, y: 0 },
      ...card
    };

    this.cards.push(newCard);
    return newCard;
  }

  public updateCard(id: number, updates: Partial<Card>): Card {
    const index = this.cards.findIndex(card => card.id === id);
    if (index === -1) {
      throw new Error(`Карточка с ID ${id} не найдена`);
    }

    this.cards[index] = { ...this.cards[index], ...updates };
    return this.cards[index];
  }

  public deleteCard(id: number): void {
    const index = this.cards.findIndex(card => card.id === id);
    if (index === -1) {
      throw new Error(`Карточка с ID ${id} не найдена`);
    }

    // Удаляем все связи для этой карточки
    this.edges = this.edges.filter(edge => 
      edge.source !== id && edge.target !== id
    );

    // Удаляем карточку
    this.cards.splice(index, 1);
  }

  // Методы для работы со связями
  public addEdge(source: number, target: number, options: Partial<Edge> = {}): Edge {
    // Проверяем существование карточек
    if (!this.cards.some(card => card.id === source)) {
      throw new Error(`Исходная карточка с ID ${source} не найдена`);
    }
    if (!this.cards.some(card => card.id === target)) {
      throw new Error(`Целевая карточка с ID ${target} не найдена`);
    }

    const edgeId = `${source}-${target}-${Date.now()}`;
    const newEdge: Edge = {
      id: options.id || edgeId,
      source,
      target,
      label: options.label || '',
      type: options.type || 'default',
      color: options.color || '#cccccc',
      ...options
    };

    this.edges.push(newEdge);
    return newEdge;
  }

  public updateEdge(id: string, updates: Partial<Edge>): Edge {
    const index = this.edges.findIndex(edge => edge.id === id);
    if (index === -1) {
      throw new Error(`Связь с ID ${id} не найдена`);
    }

    this.edges[index] = { ...this.edges[index], ...updates };
    return this.edges[index];
  }

  public deleteEdge(id: string): void {
    const index = this.edges.findIndex(edge => edge.id === id);
    if (index === -1) {
      throw new Error(`Связь с ID ${id} не найдена`);
    }

    this.edges.splice(index, 1);
  }

  // Получение всех данных
  public getLayout(): { cards: Card[]; edges: Edge[] } {
    return {
      cards: [...this.cards],
      edges: [...this.edges]
    };
  }

  public getCard(id: number): Card | undefined {
    return this.cards.find(card => card.id === id);
  }

  public getEdge(id: string): Edge | undefined {
    return this.edges.find(edge => edge.id === id);
  }

  // Вспомогательные методы
  private getNextCardId(): number {
    return this.nextCardId++;
  }

  // Метод для настройки следующего ID карточки
  public setNextCardId(id: number): void {
    this.nextCardId = id;
  }

  // Метод для изменения ID карточки
  public changeCardId(oldId: number, newId: number): Card {
    // Проверяем, существует ли карточка с oldId
    const cardIndex = this.cards.findIndex(card => card.id === oldId);
    if (cardIndex === -1) {
      throw new Error(`Карточка с ID ${oldId} не найдена`);
    }

    // Проверяем, нет ли другой карточки с newId
    const existingCardIndex = this.cards.findIndex(card => card.id === newId);
    if (existingCardIndex !== -1 && existingCardIndex !== cardIndex) {
      // Увеличиваем ID существующей карточки и всех последующих
      this.cards = this.cards.map(card => {
        if (card.id >= newId && card.id !== oldId) {
          return { ...card, id: card.id + 1 };
        }
        return card;
      });

      // Обновляем связи
      this.edges = this.edges.map(edge => {
        const updatedEdge = { ...edge };
        if (edge.source >= newId && edge.source !== oldId) {
          updatedEdge.source = edge.source + 1;
        }
        if (edge.target >= newId && edge.target !== oldId) {
          updatedEdge.target = edge.target + 1;
        }
        return updatedEdge;
      });
    }

    // Обновляем ID карточки
    this.cards[cardIndex].id = newId;

    // Обновляем связи для этой карточки
    this.edges = this.edges.map(edge => {
      const updatedEdge = { ...edge };
      if (edge.source === oldId) {
        updatedEdge.source = newId;
      }
      if (edge.target === oldId) {
        updatedEdge.target = newId;
      }
      return updatedEdge;
    });

    // Обновляем nextCardId, если нужно
    this.nextCardId = Math.max(...this.cards.map(card => card.id), this.nextCardId) + 1;

    return this.cards[cardIndex];
  }
}

export default GraphService;
