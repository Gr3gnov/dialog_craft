// src/services/AutosaveService.ts
import { DialogScene } from '../shared/types/scene';
import { FileService } from './FileService';

export class AutosaveService {
  private intervalId: NodeJS.Timeout | null = null;
  private fileService: FileService;
  private intervalMs: number;

  constructor(fileService: FileService, intervalMinutes: number = 5) {
    this.fileService = fileService;
    this.intervalMs = intervalMinutes * 60 * 1000;
  }

  // Запуск автосохранения
  startAutosave(callback: () => DialogScene): void {
    // Остановим предыдущий интервал, если он был
    this.stopAutosave();

    // Установим новый интервал
    this.intervalId = setInterval(async () => {
      try {
        const scene = callback();
        await this.fileService.performAutosave(scene);
        console.log('Автосохранение выполнено успешно');
      } catch (error) {
        console.error('Ошибка при автосохранении:', error);
      }
    }, this.intervalMs);
  }

  // Остановка автосохранения
  stopAutosave(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Получение списка автосохранений
  async getAutosaves(): Promise<string[]> {
    return this.fileService.getAutosaveFiles();
  }

  // Восстановление из автосохранения
  async restoreAutosave(path: string): Promise<DialogScene> {
    return this.fileService.loadAutosave(path);
  }
}
