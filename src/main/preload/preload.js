/**
 * Preload Script - Enhanced with Settings API
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
    selectOutputDirectory: () => ipcRenderer.invoke('file:select-output-directory'),
    getInfo: (filePath) => ipcRenderer.invoke('file:get-info', filePath),
    validate: (filePath) => ipcRenderer.invoke('file:validate', filePath)
  },

  // Video processing
  video: {
    process: (options) => ipcRenderer.invoke('video:process', options),
    cancel: () => ipcRenderer.invoke('video:cancel'),
    getMetadata: (filePath) => ipcRenderer.invoke('video:get-metadata', filePath)
  },

  // Enhanced settings
  settings: {
    get: (key, defaultValue) => ipcRenderer.invoke('settings:get', key, defaultValue),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:get-all'),
    reset: () => ipcRenderer.invoke('settings:reset'),
    export: () => ipcRenderer.invoke('settings:export'),
    import: () => ipcRenderer.invoke('settings:import')
  },

  // Enhanced system info
  system: {
    getInfo: () => ipcRenderer.invoke('system:info'),
    getVersion: () => ipcRenderer.invoke('system:version'),
    openPath: (filePath) => ipcRenderer.invoke('system:open-path', filePath),
    getDefaultPaths: () => ipcRenderer.invoke('system:get-default-paths'),
    getBatteryStatus: () => ipcRenderer.invoke('system:battery-status'),
    getPerformance: () => ipcRenderer.invoke('system:performance')
  },

  // Event listeners
  on: (channel, callback) => {
    const validChannels = [
      'video:progress',
      'video:complete',
      'video:error',
      'app:theme-changed',
      'settings:updated'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  off: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});

console.log('Frame Evolve preload script loaded with enhanced API');
