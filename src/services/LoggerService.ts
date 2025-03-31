// src/services/LoggerService.ts
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  details: string;
  stack?: string;
  filePath?: string;
}

export class LoggerService {
  private logs: LogEntry[] = [];
  private logDir: string;
  private maxLogs: number = 100;

  constructor() {
    // Создаем директорию для логов
    this.logDir = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Логирование ошибки
  logError(error: Error, additionalInfo: string = ''): LogEntry {
    const timestamp = new Date().toISOString();
    const id = `err_${Date.now()}`;
    const message = error.message || 'Неизвестная ошибка';
    const details = additionalInfo || 'Дополнительная информация отсутствует';
    const stack = error.stack;

    // Сохраняем лог в файл
    const fileName = `${id}.log`;
    const filePath = path.join(this.logDir, fileName);

    const logContent = `
Timestamp: ${timestamp}
Error: ${message}
Details: ${details}
Stack: ${stack || 'Stack trace unavailable'}
    `.trim();

    fs.writeFileSync(filePath, logContent, 'utf-8');

    // Создаем запись лога
    const logEntry: LogEntry = {
      id,
      timestamp,
      message,
      details,
      stack,
      filePath
    };

    // Добавляем в массив логов
    this.logs.unshift(logEntry);

    // Ограничиваем количество хранимых логов
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    return logEntry;
  }

  // Получение всех логов
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Очистка всех логов
  clearLogs(): void {
    this.logs = [];
  }

  // Удаление конкретного лога по индексу
  deleteLog(id: string): void {
    const index = this.logs.findIndex(log => log.id === id);
    if (index !== -1) {
      const logEntry = this.logs[index];
      // Удаляем файл лога, если он существует
      if (logEntry.filePath && fs.existsSync(logEntry.filePath)) {
        fs.unlinkSync(logEntry.filePath);
      }
      // Удаляем запись из массива
      this.logs.splice(index, 1);
    }
  }

  // Получение содержимого файла лога
  getLogFileContent(id: string): string | null {
    const logEntry = this.logs.find(log => log.id === id);
    if (logEntry && logEntry.filePath && fs.existsSync(logEntry.filePath)) {
      return fs.readFileSync(logEntry.filePath, 'utf-8');
    }
    return null;
  }
}
