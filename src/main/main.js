// src/main/main.js
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

let mainWindow;

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-new-project');
            }
          }
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-open-project');
            }
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-save-project');
            }
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-save-project-as');
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About Dialog Craft',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: 'About Dialog Craft',
              message: 'Dialog Craft v3',
              detail: 'A tool for creating and managing interactive dialog trees.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu customization
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

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

  // Create application menu
  createMenu();
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

  // Add handler for save-dialog
  ipcMain.handle('save-dialog', async (event, options) => {
    if (!mainWindow) return { canceled: true };

    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        properties: ['createDirectory', 'showOverwriteConfirmation'],
        filters: [
          { name: 'Dialog Craft Files', extensions: ['dc', 'json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        ...options
      });

      console.log('Save dialog result:', result);
      return result;
    } catch (error) {
      console.error('Error showing save dialog:', error);
      return { canceled: true, error: error.message };
    }
  });

  // Add handler for saving file
  ipcMain.handle('save-file', async (event, { filePath, data }) => {
    if (!filePath || !data) {
      return { success: false, error: 'Invalid file path or data' };
    }

    try {
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return { success: true };
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, error: error.message };
    }
  });

  // Add handler for loading file
  ipcMain.handle('load-file', async (event, { filePath }) => {
    if (!filePath) {
      return { success: false, error: 'Invalid file path' };
    }

    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      console.error('Error loading file:', error);
      return { success: false, error: error.message };
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
