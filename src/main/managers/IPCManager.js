/**
 * IPC Manager - Simple Storage Version
 */

const { ipcMain, dialog, BrowserWindow } = require('electron');
const { VideoProcessor } = require('../services/VideoProcessor');
const { FileService } = require('../services/FileService');
const { SystemService } = require('../services/SystemService');

class IPCManager {
  constructor(configManager) {
    this.videoProcessor = new VideoProcessor();
    this.fileService = new FileService();
    this.systemService = new SystemService();
    this.configManager = configManager; // Use passed config manager
    
    this.setupHandlers();
  }

  setupHandlers() {
    this.setupWindowHandlers();
    this.setupFileHandlers();
    this.setupVideoHandlers();
    this.setupSettingsHandlers();
    this.setupSystemHandlers();
  }

  setupWindowHandlers() {
    ipcMain.handle('window:minimize', () => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) window.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) {
        if (window.isMaximized()) {
          window.unmaximize();
        } else {
          window.maximize();
        }
      }
    });

    ipcMain.handle('window:close', () => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) window.close();
    });

    ipcMain.handle('window:isMaximized', () => {
      const window = BrowserWindow.getFocusedWindow();
      return window ? window.isMaximized() : false;
    });
  }

  setupFileHandlers() {
    ipcMain.handle('file:select-video', async () => {
      const result = await dialog.showOpenDialog({
        title: 'Select Video File',
        filters: [
          {
            name: 'Video Files',
            extensions: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v']
          },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle('file:select-output', async () => {
      const result = await dialog.showSaveDialog({
        title: 'Save Enhanced Video',
        defaultPath: 'enhanced-video.mp4',
        filters: [
          { name: 'MP4 Video', extensions: ['mp4'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      return result.canceled ? null : result.filePath;
    });

    ipcMain.handle('file:get-info', async (event, filePath) => {
      return await this.fileService.getVideoInfo(filePath);
    });

    ipcMain.handle('file:validate', async (event, filePath) => {
      return await this.fileService.validateVideoFile(filePath);
    });
  }

  setupVideoHandlers() {
    ipcMain.handle('video:process', async (event, options) => {
      try {
        const result = await this.videoProcessor.process(options, (progress) => {
          event.sender.send('video:progress', progress);
        });
        
        event.sender.send('video:complete', result);
        return result;
      } catch (error) {
        event.sender.send('video:error', error.message);
        throw error;
      }
    });

    ipcMain.handle('video:cancel', async () => {
      return await this.videoProcessor.cancel();
    });

    ipcMain.handle('video:get-metadata', async (event, filePath) => {
      return await this.videoProcessor.getVideoMetadata(filePath);
    });
  }

  setupSettingsHandlers() {
    ipcMain.handle('settings:get', (event, key, defaultValue) => {
      return this.configManager.get(key, defaultValue);
    });

    ipcMain.handle('settings:set', (event, key, value) => {
      this.configManager.set(key, value);
      return true;
    });

    ipcMain.handle('settings:get-all', () => {
      return this.configManager.getAll();
    });
  }

  setupSystemHandlers() {
    ipcMain.handle('system:info', async () => {
      return await this.systemService.getSystemInfo();
    });

    ipcMain.handle('system:version', () => {
      return process.versions;
    });
  }
}

module.exports = { IPCManager };
