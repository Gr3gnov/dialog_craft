// src/services/CytoscapeService.ts
import cytoscape, { Core, ElementDefinition, ElementsDefinition } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Card } from '../shared/types/card';
import { Edge } from '../shared/types/edge';

// Register the dagre layout
cytoscape.use(dagre);

export class CytoscapeService {
  private cy: Core | null = null;
  private container: HTMLElement | null = null;
  private nodeSelectedCallback: ((id: number) => void) | null = null;
  private edgeSelectedCallback: ((id: string) => void) | null = null;
  private nodeMovedCallback: ((id: number, position: { x: number; y: number }) => void) | null = null;
  private startEdgeCreationCallback: ((sourceId: number) => void) | null = null;

  /**
   * Initialize Cytoscape with a container element
   */
  initialize(container: HTMLElement): void {
    this.container = container;
    interface CytoscapeStyle {
      selector: string;
      style: Record<string, string | number | ((ele: cytoscape.SingularElementArgument) => string)>;
    }

    interface CytoscapeLayout {
      name: string;
    }

    this.cy = cytoscape({
      container: container as HTMLElement,
      style: [
      {
        selector: 'node',
        style: {
        'background-color': '#fff',
        'border-width': 1,
        'border-color': 'rgba(126, 126, 126, 0.8)',
        'border-style': 'solid',
        'width': '300px',
        'height': '80px',
        'shape': 'rectangle',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': '200px',
        'color': '#000',
        'font-family': 'Inter, sans-serif',
        'font-size': '10px',
        'font-weight': 500,
        'label': (ele: cytoscape.SingularElementArgument) => {
          const title = ele.data('title') || '';
          const text = ele.data('text') || '';
          return title + '\n' + text;
        }
        }
      },
      {
        selector: 'node.narrator',
        style: {
        'background-color': '#f8f9fa'
        }
      },
      {
        selector: 'node.thought',
        style: {
        'border-style': 'dashed'
        }
      },
      {
        selector: 'edge',
        style: {
        'width': 2,
        'line-color': 'data(color)',
        'target-arrow-color': 'data(color)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '12px',
        'text-background-color': 'data(color)',
        'text-background-opacity': 0.7,
        'text-background-padding': '2px',
        'color': '#fff'
        }
      },
      {
        selector: ':selected',
        style: {
        'border-width': 2,
        'border-color': '#324EFF'
        }
      }
      ] as CytoscapeStyle[],
      layout: {
      name: 'preset'
      } as CytoscapeLayout,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for cytoscape elements
   */
  private setupEventHandlers(): void {
    if (!this.cy) return;

    // Node selected event
    this.cy.on('tap', 'node', (event) => {
      const id = parseInt(event.target.id());
      if (this.nodeSelectedCallback) {
        this.nodeSelectedCallback(id);
      }
    });

    // Edge selected event
    this.cy.on('tap', 'edge', (event) => {
      const id = event.target.id();
      if (this.edgeSelectedCallback) {
        this.edgeSelectedCallback(id);
      }
    });

    // Background clicked (deselect)
    this.cy.on('tap', (event) => {
      if (event.target === this.cy) {
        if (this.nodeSelectedCallback) {
          this.nodeSelectedCallback(-1); // -1 indicates deselection
        }
        if (this.edgeSelectedCallback) {
          this.edgeSelectedCallback('');
        }
      }
    });

    // Node moved event
    this.cy.on('dragfree', 'node', (event) => {
      const id = parseInt(event.target.id());
      const position = event.target.position();
      if (this.nodeMovedCallback) {
        this.nodeMovedCallback(id, { x: position.x, y: position.y });
      }
      // Update overlays when node is moved
      this.addNodeOverlays();
    });

    // Update overlays when the graph is panned or zoomed
    this.cy.on('pan zoom', () => {
      setTimeout(() => this.addNodeOverlays(), 10);
    });

    // Update overlays when node positions change
    this.cy.on('position', 'node', () => {
      setTimeout(() => this.addNodeOverlays(), 10);
    });
  }

  /**
   * After rendering the graph, add interactive elements to nodes
   */
  private addNodeOverlays(): void {
    if (!this.cy || !this.container) return;

    // First remove all existing overlays
    const existingOverlays = document.querySelectorAll('.cy-node-overlay');
    existingOverlays.forEach(overlay => overlay.remove());

    // Add overlays for each node
    this.cy.nodes().forEach(node => {
      const position = node.renderedPosition();
      const dimensions = {
        width: node.renderedWidth(),
        height: node.renderedHeight()
      };

      const overlay = document.createElement('div');
      overlay.className = 'cy-node-overlay';
      overlay.id = `overlay-${node.id()}`;
      overlay.style.position = 'absolute';
      overlay.style.left = `${position.x - dimensions.width/2}px`;
      overlay.style.top = `${position.y - dimensions.height/2}px`;
      overlay.style.width = `${dimensions.width}px`;
      overlay.style.height = `${dimensions.height}px`;

      // Entry point
      const entryPoint = document.createElement('div');
      entryPoint.className = 'cy-node-entry-point';
      entryPoint.style.position = 'absolute';
      entryPoint.style.left = '15px';
      entryPoint.style.top = '-5px';
      overlay.appendChild(entryPoint);

      // Exit point
      const exitPoint = document.createElement('div');
      exitPoint.className = 'cy-node-exit-point';
      exitPoint.style.position = 'absolute';
      exitPoint.style.right = '15px';
      exitPoint.style.bottom = '-5px';
      overlay.appendChild(exitPoint);

      // Connectors (buttons)
      const connectors = document.createElement('div');
      connectors.className = 'cy-node-connectors';
      connectors.style.position = 'absolute';
      connectors.style.left = '10px';
      connectors.style.bottom = '-20px';
      connectors.style.display = 'flex';
      connectors.style.gap = '19px';

      // Create 5 buttons with different colors
      const colors = ['red', 'yellow', 'cyan', 'green', 'black'];
      colors.forEach(color => {
        const button = document.createElement('button');
        button.className = `cy-connector-button ${color}`;
        button.title = 'Create connection';

        const inner = document.createElement('div');
        inner.className = 'cy-connector-inner';
        button.appendChild(inner);

        // Add event handler for starting edge creation
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const nodeId = parseInt(node.id());
          if (this.startEdgeCreationCallback) {
            this.startEdgeCreationCallback(nodeId);
          }
        });

        connectors.appendChild(button);
      });

      overlay.appendChild(connectors);
      this.container.appendChild(overlay);
    });
  }

  /**
   * Render graph with cards and edges
   */
  renderGraph(cards: Card[], edges: Edge[]): void {
    if (!this.cy) return;

    // Convert cards and edges to Cytoscape elements
    const elements: ElementsDefinition = {
      nodes: cards.map(card => this.createNodeDefinition(card)),
      edges: edges.map(edge => this.createEdgeDefinition(edge))
    };

    // Clear existing elements and add new ones
    this.cy.elements().remove();
    this.cy.add(elements);

    // Add overlays after rendering
    setTimeout(() => this.addNodeOverlays(), 100);
  }

  /**
   * Create a node definition from a card
   */
  private createNodeDefinition(card: Card): ElementDefinition {
    const classes = [];
    if (card.is_narrator) classes.push('narrator');
    if (card.is_thought) classes.push('thought');

    return {
      data: {
        id: card.id.toString(),
        title: card.title,
        text: card.text,
        character_name: card.character_name || ''
      },
      position: {
        x: card.position.x,
        y: card.position.y
      },
      classes: classes.join(' ')
    };
  }

  /**
   * Create an edge definition from an edge
   */
  private createEdgeDefinition(edge: Edge): cytoscape.EdgeDefinition {
    return {
      data: {
        id: edge.id,
        source: edge.source.toString(),
        target: edge.target.toString(),
        label: edge.label || '',
        type: edge.type || 'normal',
        color: edge.color || this.getEdgeColor(edge.type)
      }
    };
  }

  /**
   * Get color based on edge type
   */
  private getEdgeColor(type?: string): string {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'failure': return '#F44336';
      case 'special': return '#FF9800';
      default: return '#607D8B';
    }
  }

  /**
   * Apply automatic layout to the graph
   */
  applyLayout(): void {
    if (!this.cy) return;

    this.cy.layout({
      name: 'dagre',
      // Correct parameters for dagre layout
      rankDir: 'TB', // Top to bottom layout
      nodeDimensionsIncludeLabels: true,
      spacingFactor: 1.5,
      animate: true,
      animationDuration: 500
    } as any).run();

    // Update overlays after layout changes
    setTimeout(() => this.addNodeOverlays(), 600);
  }

  /**
   * Select a node or edge
   */
  selectElement(type: 'node' | 'edge', id: number | string): void {
    if (!this.cy) return;

    // Deselect all elements first
    this.cy.elements().unselect();

    // Select the specific element
    if (id !== -1 && id !== '') {
      const idStr = typeof id === 'number' ? id.toString() : id;
      const element = this.cy.getElementById(idStr);
      if (element.length > 0) {
        element.select();
      }
    }
  }

  /**
   * Center the view on a specific element
   */
  centerOn(id: string): void {
    if (!this.cy) return;

    const element = this.cy.getElementById(id);
    if (element.length > 0) {
      this.cy.animate({
        center: {
          eles: element
        },
        zoom: 1.5
      }, {
        duration: 500
      });
    }
  }

  /**
   * Register callback for node selection
   */
  onNodeSelected(callback: (id: number) => void): void {
    this.nodeSelectedCallback = callback;
  }

  /**
   * Register callback for edge selection
   */
  onEdgeSelected(callback: (id: string) => void): void {
    this.edgeSelectedCallback = callback;
  }

  /**
   * Register callback for node movement
   */
  onNodeMoved(callback: (id: number, position: { x: number; y: number }) => void): void {
    this.nodeMovedCallback = callback;
  }

  /**
   * Register callback for starting edge creation
   */
  onStartEdgeCreation(callback: (sourceId: number) => void): void {
    this.startEdgeCreationCallback = callback;
  }
}
