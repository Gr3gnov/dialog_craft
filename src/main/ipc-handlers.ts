// src/main/ipc-handlers.ts
import { ipcMain, dialog } from 'electron';
import { FileService } from '../services/FileService';
import { ExportImportService } from '../services/ExportImportService';
import { LoggerService } from '../services/LoggerService';
import { DialogScene } from '../shared/types/scene';
import * as fs from 'fs';

// Инициализация сервисов
const fileService = new FileService();
const exportImportService = new ExportImportService();
const loggerService = new LoggerService();

// Настройка IPC обработчиков
export function setupIpcHandlers() {
  // Обработчик сохранения файла
  ipcMain.handle('save-file', async (event, sceneData: DialogScene) => {
    try {
      const filePath = await fileService.selectSavePath();
      if (!filePath) return { success: false, message: 'Операция отменена пользователем' };

      await fileService.saveScene(sceneData, filePath);
      return { success: true, filePath };
    } catch (error) {
      loggerService.logError(error as Error, 'Ошибка при сохранении файла');
      return { success: false, message: (error as Error).message };
    }
  });

  // Обработчик открытия файла
  ipcMain.handle('open-file', async () => {
    try {
      const filePath = await fileService.selectLoadPath();
      if (!filePath) return { success: false, message: 'Операция отменена пользователем' };

      const scene = await fileService.loadScene(filePath);
      return { success: true, scene, filePath };
    } catch (error) {
      loggerService.logError(error as Error, 'Ошибка при открытии файла');
      return { success: false, message: (error as Error).message };
    }
  });

  // Обработчик экспорта в YAML
  ipcMain.handle('export-yaml', async (event, sceneData: DialogScene) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Экспорт в YAML',
        defaultPath: `${sceneData.name || 'scene'}.yaml`,
        filters: [
          { name: 'YAML Files', extensions: ['yaml', 'yml'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled) return { success: false, message: 'Операция отменена пользователем' };

      const yamlContent = exportImportService.exportToYAML(sceneData);
      await fs.promises.writeFile(result.filePath, yamlContent, 'utf-8');

      return { success: true, filePath: result.filePath };
    } catch (error) {
      loggerService.logError(error as Error, 'Ошибка при экспорте в YAML');
      return { success: false, message: (error as Error).message };
    }
  });

  // Обработчик импорта из YAML
  ipcMain.handle('import-yaml', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Импорт из YAML',
        filters: [
          { name: 'YAML Files', extensions: ['yaml', 'yml'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled) return { success: false, message: 'Операция отменена пользователем' };

      const yamlContent = await fs.promises.readFile(result.filePaths[0], 'utf-8');
      const scene = exportImportService.importFromYAML(yamlContent);

      return { success: true, scene };
    } catch (error) {
      loggerService.logError(error as Error, 'Ошибка при импорте из YAML');
      return { success: false, message: (error as Error).message };
    }
  });

  // Обработчик получения логов
  ipcMain.handle('get-logs', () => {
    return loggerService.getLogs();
  });

  // Обработчик очистки логов
  ipcMain.handle('clear-logs', () => {
    loggerService.clearLogs();
    return { success: true };
  });

  // Обработчик удаления лога
  ipcMain.handle('delete-log', (event, id: string) => {
    loggerService.deleteLog(id);
    return { success: true };
  });

  // Обработчик получения содержимого файла лога
  ipcMain.handle('get-log-content', (event, id: string) => {
    const content = loggerService.getLogFileContent(id);
    return { content };
  });

  // Обработчик получения автосохранений
  ipcMain.handle('get-autosaves', async () => {
    const files = await fileService.getAutosaveFiles();
    return { files };
  });

  // Обработчик загрузки автосохранения
  ipcMain.handle('load-autosave', async (event, filePath: string) => {
    try {
      const scene = await fileService.loadAutosave(filePath);
      return { success: true, scene };
    } catch (error) {
      loggerService.logError(error as Error, 'Ошибка при загрузке автосохранения');
      return { success: false, message: (error as Error).message };
    }
  });
}
