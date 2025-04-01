// src/renderer/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Canvas } from '../components/Canvas/Canvas';
import { PropertyPanel } from '../components/PropertyPanel/PropertyPanel';
import { GraphService } from '../../services/GraphService';
import { EditorProvider } from '../contexts/EditorContext';
import './MainLayout.css';

// Create service instance
const graphService = new GraphService();

// Add some test cards and connections
const initializeTestData = () => {
  // Add cards
  graphService.addCard({
    id: 1,
    title: 'Start Dialog',
    text: 'Hello, traveler! Where are you headed?',
    character_name: 'Elder',
    position: { x: 100, y: 100 },
    is_narrator: true,
    is_thought: false
  });

  graphService.addCard({
    id: 2,
    title: 'Response 1',
    text: 'I\'m going to the nearby village.',
    position: { x: 100, y: 250 },
    is_narrator: false,
    is_thought: false
  });

  graphService.addCard({
    id: 3,
    title: 'Response 2',
    text: 'None of your business, old man.',
    position: { x: 300, y: 250 },
    is_narrator: false,
    is_thought: true
  });

  graphService.addCard({
    id: 4,
    title: 'Reaction to Response 1',
    text: 'Be careful, there have been wolf sightings in the forest.',
    character_name: 'Elder',
    position: { x: 100, y: 400 },
    is_narrator: false,
    is_thought: false
  });

  graphService.addCard({
    id: 5,
    title: 'Reaction to Response 2',
    text: 'How rude! Well, go on your way then.',
    character_name: 'Elder',
    position: { x: 300, y: 400 },
    is_narrator: false,
    is_thought: false
  });

  // Add connections
  graphService.addEdge(1, 2, { label: 'Polite', color: '#4CAF50' });
  graphService.addEdge(1, 3, { label: 'Rude', color: '#F44336' });
  graphService.addEdge(2, 4, { label: 'Continue' });
  graphService.addEdge(3, 5, { label: 'Continue' });
};

// Initialize test data
initializeTestData();

export const MainLayout: React.FC = () => {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  // Handle creating a new scene
  const handleNewScene = () => {
    if (window.confirm('Create a new scene? Any unsaved changes will be lost.')) {
      graphService.setScene({
        id: crypto.randomUUID(),
        name: 'New Scene',
        cards: [],
        edges: []
      });
      setCurrentFilePath(null);
    }
  };

  // Handle opening a file (will be connected to IPC handlers later)
  const handleOpenFile = async () => {
    // Temporary placeholder for file open functionality
    alert('Open file functionality will be implemented with IPC handlers');
    // Will be implemented when we connect with Electron IPC
  };

  // Handle saving a file (will be connected to IPC handlers later)
  const handleSaveFile = async () => {
    // Temporary placeholder for file save functionality
    alert('Save file functionality will be implemented with IPC handlers');
    // Will be implemented when we connect with Electron IPC
  };

  // Handle exporting to YAML (will be connected to IPC handlers later)
  const handleExportYaml = async () => {
    // Temporary placeholder for YAML export functionality
    alert('Export to YAML functionality will be implemented with IPC handlers');
    // Will be implemented when we connect with Electron IPC
  };

  return (
    <EditorProvider graphService={graphService}>
      <div className="main-layout">
        <header className="app-header">
          <h1>Dialog Craft</h1>
          <div className="header-actions">
            <button className="header-button" onClick={handleNewScene}>New Scene</button>
            <button className="header-button" onClick={handleOpenFile}>Open</button>
            <button className="header-button" onClick={handleSaveFile}>Save</button>
            <button className="header-button" onClick={handleExportYaml}>Export to YAML</button>
          </div>
        </header>
        <main className="main-content">
          <Canvas />
          <PropertyPanel />
        </main>
      </div>
    </EditorProvider>
  );
};
