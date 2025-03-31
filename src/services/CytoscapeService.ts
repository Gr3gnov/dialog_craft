// Упрощенная версия src/services/CytoscapeService.ts для тестового запуска
import cytoscape, { Core } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Card } from '../shared/types/card';
import { Edge } from '../shared/types/edge';

// Регистрируем плагин Dagre для автоматического расположения
cytoscape.use(dagre);

export class CytoscapeService {
  private cy: Core | null = null;
  private nodeSelectedCallback: ((id: number) => void) | null = null;
  private edgeSelectedCallback: ((id: string) => void) | null = null;

  // Инициализация Cytoscape
  initialize(container: HTMLElement): void {
    this.cy = cytoscape({
      container,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#fff',
            'border-width': 1,
            'border-color': '#ccc',
            'width': '300px',
            'height': '100px',
            'shape': 'rectangle',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'padding': '10px',
            'font-size': '14px',
            'label': 'data(title)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': '2px',
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)'
          }
        }
      ],
      layout: {
        name: 'preset'
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
    });

    // Базовые обработчики событий
    if (this.cy) {
      this.cy.on('tap', 'node', (event) => {
        const id = parseInt(event.target.id());
        if (this.nodeSelectedCallback) {
          this.nodeSelectedCallback(id);
        }
      });

      this.cy.on('tap', 'edge', (event) => {
        const id = event.target.id();
        if (this.edgeSelectedCallback) {
          this.edgeSelectedCallback(id);
        }
      });
    }
  }

  // Рендеринг графа
  renderGraph(cards: Card[], edges: Edge[]): void {
    if (!this.cy) return;

    this.cy.elements().remove();

    // Добавляем узлы
    cards.forEach(card => {
      this.cy?.add({
        group: 'nodes',
        data: {
          id: card.id.toString(),
          title: card.title,
          text: card.text
        },
        position: {
          x: card.position.x,
          y: card.position.y
        }
      });
    });

    // Добавляем ребра
    edges.forEach(edge => {
      this.cy?.add({
        group: 'edges',
        data: {
          id: edge.id,
          source: edge.source.toString(),
          target: edge.target.toString(),
          label: edge.label || ''
        }
      });
    });
  }

  // Обработчики событий
  onNodeSelected(callback: (id: number) => void): void {
    this.nodeSelectedCallback = callback;
  }

  onEdgeSelected(callback: (id: string) => void): void {
    this.edgeSelectedCallback = callback;
  }
}
