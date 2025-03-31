// src/services/FileService.ts
import { DialogScene } from '../shared/types/scene';
import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export class FileService {
  private autosaveDir: string;
  private maxAutosaves: number = 5;

  constructor() {
    // Создаем директорию для автосохранений
    this.autosaveDir = path.join(app.getPath('userData'), 'autosaves');
    if (!fs.existsSync(this.autosaveDir)) {
      fs.mkdirSync(this.autosaveDir, { recursive: true });
    }
  }

  // Метод для выбора пути сохранения файла через диалог
  async selectSavePath(): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      title: 'Сохранить сцену',
      defaultPath: 'новая_сцена.dcscene',
      filters: [
        { name: 'Dialog Craft Scene', extensions: ['dcscene'] },
        { name: 'Все файлы', extensions: ['*'] }
      ]
    });

    return result.canceled ? null : result.filePath;
  }

  // Метод для выбора файла для загрузки через диалог
  async selectLoadPath(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: 'Открыть сцену',
      filters: [
        { name: 'Dialog Craft Scene', extensions: ['dcscene'] },
        { name: 'Все файлы', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    return result.canceled ? null : result.filePaths[0];
  }

  // Сохранение сцены в файл
  async saveScene(scene: DialogScene, filePath: string): Promise<void> {
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(scene, null, 2), 'utf-8');
    } catch (error) {
      console.error('Ошибка при сохранении файла:', error);
      throw new Error(`Не удалось сохранить сцену: ${error.message}`);
    }
  }

  // Загрузка сцены из файла
  async loadScene(filePath: string): Promise<DialogScene> {
    try {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data) as DialogScene;
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      throw new Error(`Не удалось загрузить сцену: ${error.message}`);
    }
  }

  // Выполнение автосохранения
  async performAutosave(scene: DialogScene): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `autosave_${scene.name}_${timestamp}.dcscene`;
    const filePath = path.join(this.autosaveDir, fileName);

    try {
      await this.saveScene(scene, filePath);
      await this.cleanupOldAutosaves();
    } catch (error) {
      console.error('Ошибка при автосохранении:', error);
      // Логируем ошибку, но не выбрасываем исключение, чтобы не прерывать работу приложения
    }
  }

  // Получение списка файлов автосохранения
  async getAutosaveFiles(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.autosaveDir);
      return files
        .filter(file => file.startsWith('autosave_') && file.endsWith('.dcscene'))
        .map(file => path.join(this.autosaveDir, file))
        .sort((a, b) => {
          // Сортировка по времени изменения файла (от новых к старым)
          const statA = fs.statSync(a);
          const statB = fs.statSync(b);
          return statB.mtime.getTime() - statA.mtime.getTime();
        });
    } catch (error) {
      console.error('Ошибка при получении списка автосохранений:', error);
      return [];
    }
  }

  // Загрузка автосохранения
  async loadAutosave(filePath: string): Promise<DialogScene> {
    return this.loadScene(filePath);
  }

  // Очистка старых автосохранений
  private async cleanupOldAutosaves(): Promise<void> {
    try {
      const files = await this.getAutosaveFiles();
      if (files.length > this.maxAutosaves) {
        // Удаляем самые старые файлы, оставляя только maxAutosaves файлов
        const filesToRemove = files.slice(this.maxAutosaves);
        for (const file of filesToRemove) {
          await fs.promises.unlink(file);
        }
      }
    } catch (error) {
      console.error('Ошибка при очистке старых автосохранений:', error);
    }
  }
}
