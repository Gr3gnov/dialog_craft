// src/renderer/types/global.d.ts
interface ElectronAPI {
    saveFile: (scene: any) => Promise<{ success: boolean; filePath?: string; message?: string }>;
    openFile: () => Promise<{ success: boolean; scene?: any; filePath?: string; message?: string }>;
    exportYaml: (scene: any) => Promise<{ success: boolean; filePath?: string; message?: string }>;
    importYaml: () => Promise<{ success: boolean; scene?: any; message?: string }>;

    getLogs: () => Promise<any[]>;
    clearLogs: () => Promise<{ success: boolean }>;
    deleteLog: (id: string) => Promise<{ success: boolean }>;
    getLogContent: (id: string) => Promise<{ content: string | null }>;

    getAutosaves: () => Promise<{ files: string[] }>;
    loadAutosave: (path: string) => Promise<{ success: boolean; scene?: any; message?: string }>;
  }

  interface Window {
    electronAPI: ElectronAPI;
  }
