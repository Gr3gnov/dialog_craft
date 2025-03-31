// src/main/main.ts
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import { setupIpcHandlers } from './ipc-handlers';

let mainWindow: BrowserWindow | null = null;

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

  // Determine the correct path for loading the app
  const isDev = process.env.NODE_ENV === 'development';
  let startUrl: string;

  if (isDev) {
    // In development, we'll try to load from the built files directly
    startUrl = url.format({
      pathname: path.join(__dirname, '../../dist/index.html'),
      protocol: 'file:',
      slashes: true
    });
  } else {
    // In production, load from the dist directory
    startUrl = url.format({
      pathname: path.join(__dirname, '../../dist/index.html'),
      protocol: 'file:',
      slashes: true
    });
  }

  console.log('Attempting to load:', startUrl);

  // Check if the file exists
  const htmlPath = path.join(__dirname, '../../dist/index.html');
  if (fs.existsSync(htmlPath)) {
    console.log('HTML file exists at:', htmlPath);
  } else {
    console.error('HTML file does not exist at:', htmlPath);
  }

  // Load the index.html of the app
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
  });

  // Setup IPC handlers
  setupIpcHandlers();

  // Open the DevTools for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
