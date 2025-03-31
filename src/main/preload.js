// src/main/preload.js
// This file will be loaded by Electron before renderer process starts
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (scene) => ipcRenderer.invoke('save-file', scene),
  openFile: () => ipcRenderer.invoke('open-file'),
  exportYaml: (scene) => ipcRenderer.invoke('export-yaml', scene),
  importYaml: () => ipcRenderer.invoke('import-yaml'),

  // Log operations
  getLogs: () => ipcRenderer.invoke('get-logs'),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),
  deleteLog: (id) => ipcRenderer.invoke('delete-log', id),
  getLogContent: (id) => ipcRenderer.invoke('get-log-content', id),

  // Autosave operations
  getAutosaves: () => ipcRenderer.invoke('get-autosaves'),
  loadAutosave: (path) => ipcRenderer.invoke('load-autosave', path)
});
