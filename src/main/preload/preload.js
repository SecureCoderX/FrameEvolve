/**
 * Preload Script - Complete Bridge
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  },

  // File operations
  file: {
    selectVideo: () => ipcRenderer.invoke('file:select-video'),
    selectOutput: () => ipcRenderer.invoke('file:select-output'),
    getInfo: (filePath) => ipcRenderer.invoke('file:get-info', filePath),
    validate: (filePath) => ipcRenderer.invoke('file:validate', filePath)
  },

  // Video processing
  video: {
    process: (options) => ipcRenderer.invoke('video:process', options),
    cancel: () => ipcRenderer.invoke('video:cancel'),
    getMetadata: (filePath) => ipcRenderer.invoke('video:get-metadata', filePath)
  },

  // Settings
  settings: {
    get: (key, defaultValue) => ipcRenderer.invoke('settings:get', key, defaultValue),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:get-all')
  },

  // Event listeners
  on: (channel, callback) => {
    const validChannels = [
      'video:progress',
      'video:complete',
      'video:error',
      'app:theme-changed'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  off: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // System info
  system: {
    getInfo: () => ipcRenderer.invoke('system:info'),
    getVersion: () => ipcRenderer.invoke('system:version')
  }
});

console.log('Frame Evolve preload script loaded');
