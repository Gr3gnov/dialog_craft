// src/renderer/components/Workspace/Workspace.tsx
import React, { useEffect, useRef, useState } from 'react';
import { CytoscapeService } from '../../../services/CytoscapeService';
import { useEditor } from '../../contexts/EditorContext';
import { OverlayProvider, useOverlay } from '../../contexts/OverlayContext';
import { CardNodeOverlay } from '../CardNode/CardNodeOverlay';
import './Workspace.css';
import '../../styles/cytoscape-custom.css';

interface WorkspaceProps {
  cytoscapeService: CytoscapeService;
}

const WorkspaceComponent: React.FC<WorkspaceProps> = ({ cytoscapeService }) => {
  const editor = useEditor();
  const cyContainerRef = useRef<HTMLDivElement>(null);
  const [isEdgeCreationMode, setIsEdgeCreationMode] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<number | null>(null);
  const { registerOverlay, unregisterOverlay } = useOverlay();

  // Initialize Cytoscape when component mounts
  useEffect(() => {
    if (cyContainerRef.current) {
      cytoscapeService.initialize(cyContainerRef.current);

      // Register overlay callbacks
      cytoscapeService.setOverlayCallbacks(registerOverlay, unregisterOverlay);

      // Pass cards and connections from current scene to Cytoscape
      cytoscapeService.renderGraph(editor.scene.cards, editor.scene.edges);

      // Set up event handlers
      cytoscapeService.onNodeSelected((id) => {
        editor.setSelectedCard(id);
        editor.setSelectedEdge(null);
      });

      cytoscapeService.onEdgeSelected((id) => {
        editor.setSelectedEdge(id);
        editor.setSelectedCard(null);
      });

      cytoscapeService.onNodeMoved((id, position) => {
        // Update card position in editor
        editor.updateCard(id, { position });
      });

      // Add handler for starting edge creation
      cytoscapeService.onStartEdgeCreation((sourceId) => {
        setIsEdgeCreationMode(true);
        setSourceNodeId(sourceId);
      });
    }

    return () => {
      // Cleanup when component unmounts
      // (if necessary)
    };
  }, [cytoscapeService, editor, registerOverlay, unregisterOverlay]);

  // Update graph when scene changes
  useEffect(() => {
    cytoscapeService.renderGraph(editor.scene.cards, editor.scene.edges);

    // If there's a selected element, highlight it
    if (editor.selectedCardId !== null) {
      cytoscapeService.selectElement('node', editor.selectedCardId);
    } else if (editor.selectedEdgeId !== null) {
      cytoscapeService.selectElement('edge', editor.selectedEdgeId);
    }
  }, [editor.scene, editor.selectedCardId, editor.selectedEdgeId, cytoscapeService]);

  // Handler for starting edge creation
  const handleStartEdgeCreation = (sourceId: number) => {
    setIsEdgeCreationMode(true);
    setSourceNodeId(sourceId);
  };

  // Handler for completing edge creation
  const handleCompleteEdgeCreation = (targetId: number) => {
    if (sourceNodeId !== null && sourceNodeId !== targetId) {
      editor.addEdge(sourceNodeId, targetId);
    }
    setIsEdgeCreationMode(false);
    setSourceNodeId(null);
  };

  // Handler for canceling edge creation
  const handleCancelEdgeCreation = () => {
    setIsEdgeCreationMode(false);
    setSourceNodeId(null);
  };

  // Handler for adding a new card
  const handleAddCard = () => {
    const newCard = editor.addCard({
      position: { x: 100, y: 100 } // Default position
    });

    // Select the new card
    editor.setSelectedCard(newCard.id);

    // Center view on the new card
    cytoscapeService.centerOn(newCard.id.toString());
  };

  // Handler for auto layout
  const handleAutoLayout = () => {
    cytoscapeService.applyLayout();
  };

  return (
    <div className="workspace-container">
      {/* Toolbar */}
      <div className="workspace-toolbar">
        <button
          onClick={handleAddCard}
          className="toolbar-button"
          title="Add Card"
        >
          <span>+</span> Card
        </button>
        <button
          onClick={handleAutoLayout}
          className="toolbar-button"
          title="Auto Layout"
        >
          <span>⟲</span> Layout
        </button>
        {isEdgeCreationMode && (
          <div className="edge-creation-mode">
            <span>Edge creation mode: select target card</span>
            <button
              onClick={handleCancelEdgeCreation}
              className="toolbar-button"
              title="Cancel edge creation"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Cytoscape container */}
      <div
        ref={cyContainerRef}
        className="cytoscape-container"
      >
        {/* Render card overlays */}
        {editor.scene.cards.map(card => (
          <CardNodeOverlay
            key={card.id}
            card={card}
            selected={editor.selectedCardId === card.id}
            onSelect={editor.setSelectedCard}
            onStartEdge={handleStartEdgeCreation}
          />
        ))}
      </div>
    </div>
  );
};

// Wrap with OverlayProvider
export const Workspace: React.FC<WorkspaceProps> = (props) => (
  <OverlayProvider>
    <WorkspaceComponent {...props} />
  </OverlayProvider>
);
