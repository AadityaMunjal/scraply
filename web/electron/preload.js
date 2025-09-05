const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Training functions
  trainModel: (config) => ipcRenderer.invoke('train-model', config),
  
  // Notebook generation
  generateNotebook: (config) => ipcRenderer.invoke('generate-notebook', config),
  
  // File operations
  saveFile: (defaultPath, data) => ipcRenderer.invoke('save-file', defaultPath, data),
  
  // Health check
  checkPythonHealth: () => ipcRenderer.invoke('check-python-health'),
  
  // Listen for training progress
  onTrainingProgress: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('training-progress', subscription);
    
    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('training-progress', subscription);
    };
  },
  
  // Environment detection
  isDev: process.env.ELECTRON_IS_DEV === '1'
});

