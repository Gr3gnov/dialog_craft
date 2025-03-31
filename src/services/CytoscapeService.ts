// src/services/CytoscapeService.ts
import cytoscape, { Core, EdgeSingular, NodeSingular } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Card } from '../shared/types/card';
import { Edge } from '../shared/types/edge';

// Регистрируем плагин Dagre для автоматического расположения
cytoscape.use(dagre);

export class CytoscapeService {
  private cy: Core | null = null;
  private nodeSelectedCallback: ((id: number) => void) | null = null;
  private edgeSelectedCallback: ((id: string) => void) | null = null;
  private nodeMovedCallback: ((id: number, position: { x: number; y: number }) => void) | null = null;

  // Инициализация Cytoscape
  initialize(container: HTMLElement): void {
    this.cy = cytoscape({
      container,
      style: [
        // Стили для узлов (карточек)
        {
          selector: 'node',
          style: {
            'background-color': '#fff',
            'border-width': 1,
            'border-color': '#ccc',
            'width': 300,
            'height': 100,
            'shape': 'rectangle',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': 290,
            'padding': '10px',
            'font-size': 14,
            'label': 'data(title)'
          }
        },
        // Стили для узлов-рассказчиков
        {
          selector: 'node[is_narrator = "true"]',
          style: {
            'background-color': '#f5f5dc', // Бежевый оттенок для рассказчика
            'border-color': '#d3c38b'
          }
        },
        // Стили для узлов-мыслей
        {
          selector: 'node[is_thought = "true"]',
          style: {
            'background-color': '#e6f7ff', // Светло-голубой для мыслей
            'border-color': '#a6d8ff'
          }
        },
        // Стили для выбранного узла
        {
          selector: 'node:selected',
          style: {
            'border-width': 2,
            'border-color': '#4b7bec',
            'box-shadow': '0 0 5px #4b7bec'
          }
        },
        // Стили для ребер (связей)
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': 12,
            'text-background-opacity': 1,
            'text-background-color': '#fff',
            'text-background-padding': 3
          }
        },
        // Стили для выбранного ребра
        {
          selector: 'edge:selected',
          style: {
            'width': 3,
            'line-color': '#4b7bec',
            'target-arrow-color': '#4b7bec'
          }
        }
      ],
      layout: {
        name: 'preset' // Начальное расположение - ручное
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      autounselectify: false,
      wheelSensitivity: 0.3
    });

    // Регистрируем обработчики событий
    this.registerEventHandlers();
  }

  // Рендеринг графа
  renderGraph(cards: Card[], edges: Edge[]): void {
    if (!this.cy) {
      throw new Error('Cytoscape не инициализирован');
    }

    // Очищаем текущий граф
    this.cy.elements().remove();

    // Добавляем узлы (карточки)
    cards.forEach(card => {
      this.cy.add({
        group: 'nodes',
        data: {
          id: card.id.toString(),
          title: card.title,
          text: card.text,
          type: card.type,
          is_narrator: card.is_narrator,
          is_thought: card.is_thought,
          // Добавляем остальные свойства карточки
          ...card
        },
        position: {
          x: card.position.x,
          y: card.position.y
        }
      });
    });

    // Добавляем ребра (связи)
    edges.forEach(edge => {
      this.cy.add({
        group: 'edges',
        data: {
          id: edge.id,
          source: edge.source.toString(),
          target: edge.target.toString(),
          label: edge.label || '',
          type: edge.type || 'normal',
          color: edge.color
        }
      });

      // Устанавливаем цвет для ребра, если он указан
      if (edge.color) {
        this.cy.$(`edge[id = "${edge.id}"]`).style({
          'line-color': edge.color,
          'target-arrow-color': edge.color
        });
      }
    });

    // Обновляем отображение
    this.cy.fit();
  }

  // Применение автоматического расположения с Dagre
  applyLayout(): void {
    if (!this.cy) {
      throw new Error('Cytoscape не инициализирован');
    }

    const layout = this.cy.layout({
      name: 'dagre',
      rankDir: 'TB', // Top to Bottom - сверху вниз
      nodeSep: 50,   // Расстояние между узлами по горизонтали
      rankSep: 100,  // Расстояние между уровнями по вертикали
      padding: 30,
      fit: true,
      animate: true,
      animationDuration: 500
    });

    layout.run();
  }

  // Обработчик выбора узла
  onNodeSelected(callback: (id: number) => void): void {
    this.nodeSelectedCallback = callback;
  }

  // Обработчик выбора ребра
  onEdgeSelected(callback: (id: string) => void): void {
    this.edgeSelectedCallback = callback;
  }

  // Обработчик перемещения узла
  onNodeMoved(callback: (id: number, position: { x: number; y: number }) => void): void {
    this.nodeMovedCallback = callback;
  }

  // Получение выбранного элемента
  getSelectedElement(): { type: 'node' | 'edge', id: number | string } | null {
    if (!this.cy) {
      return null;
    }

    const selected = this.cy.$(':selected');
    if (selected.length === 0) {
      return null;
    }

    if (selected.isNode()) {
      return { type: 'node', id: parseInt(selected.id()) };
    } else if (selected.isEdge()) {
      return { type: 'edge', id: selected.id() };
    }

    return null;
  }

  // Выбор элемента по ID
  selectElement(type: 'node' | 'edge', id: number | string): void {
    if (!this.cy) {
      return;
    }

    // Сначала снимаем выделение со всех элементов
    this.cy.$(':selected').unselect();

    if (type === 'node') {
      const node = this.cy.$(`node[id = "${id}"]`);
      if (node.length > 0) {
        node.select();
      }
    } else if (type === 'edge') {
      const edge = this.cy.$(`edge[id = "${id}"]`);
      if (edge.length > 0) {
        edge.select();
      }
    }
  }

  // Регистрация обработчиков событий
  private registerEventHandlers(): void {
    if (!this.cy) {
      return;
    }

    // Обработчик выбора узла
    this.cy.on('tap', 'node', (event) => {
      const node = event.target as NodeSingular;
      const id = parseInt(node.id());

      if (this.nodeSelectedCallback) {
        this.nodeSelectedCallback(id);
      }
    });

    // Обработчик выбора ребра
    this.cy.on('tap', 'edge', (event) => {
      const edge = event.target as EdgeSingular;
      const id = edge.id();

      if (this.edgeSelectedCallback) {
        this.edgeSelectedCallback(id);
      }
    });

    // Обработчик перемещения узла
    this.cy.on('position', 'node', (event) => {
      const node = event.target as NodeSingular;
      const id = parseInt(node.id());
      const position = node.position();

      if (this.nodeMovedCallback) {
        this.nodeMovedCallback(id, { x: position.x, y: position.y });
      }
    });

    // Снятие выделения при клике на пустое пространство
    this.cy.on('tap', (event) => {
      if (event.target === this.cy) {
        // Клик был на пустом пространстве (фоне)
        this.cy.$(':selected').unselect();
      }
    });
  }

  // Метод для добавления новой связи
  startEdgeCreation(sourceId: number): void {
    if (!this.cy) {
      return;
    }

    // Здесь можно реализовать логику начала создания связи
    // Например, активировать режим выбора целевого узла
    console.log('Starting edge creation from node:', sourceId);
  }

  // Метод для центрирования на элементе
  centerOn(elementId: string | number): void {
    if (!this.cy) {
      return;
    }

    const element = this.cy.$(`#${elementId}`);
    if (element.length > 0) {
      this.cy.animate({
        center: { eles: element },
        duration: 500,
        easing: 'ease'
      });
    }
  }

  // Метод для масштабирования и отображения всего графа
  fitAll(): void {
    if (!this.cy) {
      return;
    }

    this.cy.fit();
  }

  // Получение объекта cytoscape
  getCytoscape(): Core | null {
    return this.cy;
  }
}
