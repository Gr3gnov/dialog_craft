// src/services/ExportImportService.ts
import * as yaml from 'js-yaml';
import { DialogScene } from '../shared/types/scene';
import { Card } from '../shared/types/card';
import { Edge } from '../shared/types/edge';

export class ExportImportService {
  // Export scene to YAML format
  exportToYAML(scene: DialogScene): string {
    try {
      // Clone the scene for conversion
      const sceneClone = JSON.parse(JSON.stringify(scene));

      // Sort cards by ID before export, as required in specifications
      sceneClone.cards.sort((a: Card, b: Card) => a.id - b.id);

      return yaml.dump(sceneClone, {
        indent: 2,
        lineWidth: -1, // Disable line length limit
        noRefs: true   // Avoid converting duplicate objects to references
      });
    } catch (error: unknown) {
      console.error('Error exporting to YAML:', error);
      throw new Error(`Failed to export to YAML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Import scene from YAML format
  importFromYAML(yamlContent: string): DialogScene {
    try {
      const scene = yaml.load(yamlContent) as DialogScene;

      // Verify the validity of the imported scene
      this.validateScene(scene);

      return scene;
    } catch (error: unknown) {
      console.error('Error importing from YAML:', error);
      throw new Error(`Failed to import from YAML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Methods for future expansion
  exportToJSON(scene: DialogScene): string {
    return JSON.stringify(scene, null, 2);
  }

  importFromJSON(jsonContent: string): DialogScene {
    try {
      const scene = JSON.parse(jsonContent) as DialogScene;
      this.validateScene(scene);
      return scene;
    } catch (error: unknown) {
      console.error('Error importing from JSON:', error);
      throw new Error(`Failed to import from JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Validate imported scene
  private validateScene(scene: DialogScene): void {
    // Check for required fields
    if (!scene.id || !scene.name || !Array.isArray(scene.cards) || !Array.isArray(scene.edges)) {
      throw new Error('Invalid scene format: required fields are missing');
    }

    // Check for required fields in each card
    scene.cards.forEach(card => {
      if (card.id === undefined || card.type === undefined ||
          card.title === undefined || card.text === undefined ||
          card.position === undefined) {
        throw new Error(`Invalid card format with ID ${card.id}: required fields are missing`);
      }
    });

    // Check for required fields in each connection
    scene.edges.forEach(edge => {
      if (edge.id === undefined || edge.source === undefined || edge.target === undefined) {
        throw new Error(`Invalid connection format with ID ${edge.id}: required fields are missing`);
      }
    });

    // Check for correspondence of card IDs in connections
    const cardIds = new Set(scene.cards.map(card => card.id));
    scene.edges.forEach(edge => {
      if (!cardIds.has(edge.source)) {
        throw new Error(`Connection ${edge.id} refers to a non-existent source card with ID ${edge.source}`);
      }
      if (!cardIds.has(edge.target)) {
        throw new Error(`Connection ${edge.id} refers to a non-existent target card with ID ${edge.target}`);
      }
    });
  }
}
