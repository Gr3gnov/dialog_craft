// src/main/main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Always open DevTools for debugging
  mainWindow.webContents.openDevTools();

  console.log("Starting application...");

  // Загрузка HTML напрямую из build directory
  const indexPath = path.join(__dirname, '../../build/index.html');
  console.log("Loading path:", indexPath);

  mainWindow.loadFile(indexPath);

  // Log any loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  console.log("App ready, window created");

  // Add handler for show-file-dialog
  ipcMain.handle('show-file-dialog', async (event, options) => {
    if (!mainWindow) return { canceled: true };

    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
        ],
        ...options
      });

      console.log('File dialog result:', result);
      return result;
    } catch (error) {
      console.error('Error showing file dialog:', error);
      return { canceled: true, error: error.message };
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
