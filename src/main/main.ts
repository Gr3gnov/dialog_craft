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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Setup IPC handlers before loading content
  setupIpcHandlers();

  // Determine the correct path for loading the app
  const htmlPath = path.join(__dirname, '../../dist/index.html');

  // Check if the HTML file exists and log information
  if (fs.existsSync(htmlPath)) {
    console.log('HTML file exists at:', htmlPath);
    // Load the file using file:// protocol
    const fileUrl = url.format({
      pathname: htmlPath,
      protocol: 'file:',
      slashes: true
    });
    console.log('Loading URL:', fileUrl);

    mainWindow.loadURL(fileUrl).catch(err => {
      console.error('Failed to load URL:', err);
    });
  } else {
    console.error('HTML file does not exist at:', htmlPath);
    // Fallback to a basic HTML
    mainWindow.loadURL('data:text/html,<h1>Failed to load the application</h1><p>Could not find the index.html file.</p>');
  }

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
