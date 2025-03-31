// src/main/main.ts
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { setupIpcHandlers } from './ipc-handlers';

// Предотвращаем сборку мусора
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Создаем окно браузера
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Загружаем index.html
  if (process.env.NODE_ENV === 'development') {
    // В режиме разработки загружаем из webpack-dev-server
    mainWindow.loadURL('http://localhost:9000');
    // Открываем DevTools
    mainWindow.webContents.openDevTools();
  } else {
    // В production загружаем собранный файл
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Устанавливаем обработчики событий
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Создаем окно, когда Electron будет готов
app.on('ready', () => {
  createWindow();
  setupIpcHandlers();
});

// Выход, когда все окна закрыты
app.on('window-all-closed', () => {
  // На macOS приложения обычно остаются в меню, пока пользователь не выйдет явно через Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // На macOS обычно воссоздают окно приложения, когда пользователь кликает на иконку в доке
  if (mainWindow === null) {
    createWindow();
  }
});
