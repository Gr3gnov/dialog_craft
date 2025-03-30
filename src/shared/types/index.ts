export enum CardType {
  REPLICA = "replica",
}

export interface Card {
  id: number;
  title: string;
  type: CardType;
  text: string;
  background?: string;
  portrait?: string;
  character_name?: string;
  introduce_character?: boolean;
  pause?: number;
  is_narrator: boolean;
  is_thought: boolean;
  position: { x: number; y: number };
  [key: string]: any; // Для дополнительных параметров
}

export interface Edge {
  id: string;
  source: number;
  target: number;
  label?: string;
  type?: string;
  color?: string;
}

export interface DialogScene {
  id: string;
  name: string;
  cards: Card[];
  edges: Edge[];
}
