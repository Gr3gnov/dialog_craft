// src/services/FileService.ts
import { DialogScene } from '../shared/types/scene';
import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export class FileService {
  private autosaveDir: string;
  private maxAutosaves: number = 5;

  constructor() {
    // Create directory for autosaves
    this.autosaveDir = path.join(app.getPath('userData'), 'autosaves');
    if (!fs.existsSync(this.autosaveDir)) {
      fs.mkdirSync(this.autosaveDir, { recursive: true });
    }
  }

  // Method to select a save path via dialog
  async selectSavePath(): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      title: 'Save Scene',
      defaultPath: 'new_scene.dcscene',
      filters: [
        { name: 'Dialog Craft Scene', extensions: ['dcscene'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    return result.canceled ? null : (result.filePath || null);
  }

  // Method to select a file to load via dialog
  async selectLoadPath(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: 'Open Scene',
      filters: [
        { name: 'Dialog Craft Scene', extensions: ['dcscene'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    return result.canceled ? null : (result.filePaths[0] || null);
  }

  // Save scene to file
  async saveScene(scene: DialogScene, filePath: string): Promise<void> {
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(scene, null, 2), 'utf-8');
    } catch (error: unknown) {
      console.error('Error saving file:', error);
      throw new Error(`Failed to save scene: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Load scene from file
  async loadScene(filePath: string): Promise<DialogScene> {
    try {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data) as DialogScene;
    } catch (error: unknown) {
      console.error('Error loading file:', error);
      throw new Error(`Failed to load scene: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Perform autosave
  async performAutosave(scene: DialogScene): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `autosave_${scene.name}_${timestamp}.dcscene`;
    const filePath = path.join(this.autosaveDir, fileName);

    try {
      await this.saveScene(scene, filePath);
      await this.cleanupOldAutosaves();
    } catch (error: unknown) {
      console.error('Error during autosave:', error);
      // Log the error but don't throw an exception to avoid interrupting application work
    }
  }

  // Get list of autosave files
  async getAutosaveFiles(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.autosaveDir);
      return files
        .filter(file => file.startsWith('autosave_') && file.endsWith('.dcscene'))
        .map(file => path.join(this.autosaveDir, file))
        .sort((a, b) => {
          // Sort by file modification time (from new to old)
          const statA = fs.statSync(a);
          const statB = fs.statSync(b);
          return statB.mtime.getTime() - statA.mtime.getTime();
        });
    } catch (error: unknown) {
      console.error('Error getting autosave list:', error);
      return [];
    }
  }

  // Load autosave
  async loadAutosave(filePath: string): Promise<DialogScene> {
    return this.loadScene(filePath);
  }

  // Clean up old autosaves
  private async cleanupOldAutosaves(): Promise<void> {
    try {
      const files = await this.getAutosaveFiles();
      if (files.length > this.maxAutosaves) {
        // Remove the oldest files, keeping only maxAutosaves files
        const filesToRemove = files.slice(this.maxAutosaves);
        for (const file of filesToRemove) {
          await fs.promises.unlink(file);
        }
      }
    } catch (error: unknown) {
      console.error('Error cleaning up old autosaves:', error);
    }
  }
}
