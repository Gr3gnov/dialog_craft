import { Card } from './card';
import { Edge } from './edge';

export interface DialogScene {
  id: string;
  name: string;
  cards: Card[];
  edges: Edge[];
}
