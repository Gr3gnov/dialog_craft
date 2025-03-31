// src/main/ipc-handlers.ts
import { ipcMain, dialog } from 'electron';
import { FileService } from '../services/FileService';
import { ExportImportService } from '../services/ExportImportService';
import { LoggerService } from '../services/LoggerService';
import { DialogScene } from '../shared/types/scene';
import * as fs from 'fs';

// Initialize services
const fileService = new FileService();
const exportImportService = new ExportImportService();
const loggerService = new LoggerService();

// Set up IPC handlers
export function setupIpcHandlers() {
  // File save handler
  ipcMain.handle('save-file', async (event, sceneData: DialogScene) => {
    try {
      const filePath = await fileService.selectSavePath();
      if (!filePath) return { success: false, message: 'Operation canceled by user' };

      await fileService.saveScene(sceneData, filePath);
      return { success: true, filePath };
    } catch (error: unknown) {
      loggerService.logError(error instanceof Error ? error : new Error(String(error)), 'Error saving file');
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  });

  // File open handler
  ipcMain.handle('open-file', async () => {
    try {
      const filePath = await fileService.selectLoadPath();
      if (!filePath) return { success: false, message: 'Operation canceled by user' };

      const scene = await fileService.loadScene(filePath);
      return { success: true, scene, filePath };
    } catch (error: unknown) {
      loggerService.logError(error instanceof Error ? error : new Error(String(error)), 'Error opening file');
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  });

  // YAML export handler
  ipcMain.handle('export-yaml', async (event, sceneData: DialogScene) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export to YAML',
        defaultPath: `${sceneData.name || 'scene'}.yaml`,
        filters: [
          { name: 'YAML Files', extensions: ['yaml', 'yml'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled) return { success: false, message: 'Operation canceled by user' };
      if (!result.filePath) return { success: false, message: 'No file path selected' };

      const yamlContent = exportImportService.exportToYAML(sceneData);
      await fs.promises.writeFile(result.filePath, yamlContent, 'utf-8');

      return { success: true, filePath: result.filePath };
    } catch (error: unknown) {
      loggerService.logError(error instanceof Error ? error : new Error(String(error)), 'Error exporting to YAML');
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  });

  // YAML import handler
  ipcMain.handle('import-yaml', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Import from YAML',
        filters: [
          { name: 'YAML Files', extensions: ['yaml', 'yml'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled) return { success: false, message: 'Operation canceled by user' };
      if (result.filePaths.length === 0) return { success: false, message: 'No file selected' };

      const yamlContent = await fs.promises.readFile(result.filePaths[0], 'utf-8');
      const scene = exportImportService.importFromYAML(yamlContent);

      return { success: true, scene };
    } catch (error: unknown) {
      loggerService.logError(error instanceof Error ? error : new Error(String(error)), 'Error importing from YAML');
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  });

  // Get logs handler
  ipcMain.handle('get-logs', () => {
    return loggerService.getLogs();
  });

  // Clear logs handler
  ipcMain.handle('clear-logs', () => {
    loggerService.clearLogs();
    return { success: true };
  });

  // Delete log handler
  ipcMain.handle('delete-log', (event, id: string) => {
    loggerService.deleteLog(id);
    return { success: true };
  });

  // Get log content handler
  ipcMain.handle('get-log-content', (event, id: string) => {
    const content = loggerService.getLogFileContent(id);
    return { content };
  });

  // Get autosaves handler
  ipcMain.handle('get-autosaves', async () => {
    const files = await fileService.getAutosaveFiles();
    return { files };
  });

  // Load autosave handler
  ipcMain.handle('load-autosave', async (event, filePath: string) => {
    try {
      const scene = await fileService.loadAutosave(filePath);
      return { success: true, scene };
    } catch (error: unknown) {
      loggerService.logError(error instanceof Error ? error : new Error(String(error)), 'Error loading autosave');
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  });
}
