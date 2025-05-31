/**
 * IPC Manager - Enhanced with Settings Support
 */

const { ipcMain, dialog, BrowserWindow, shell } = require('electron');
const path = require('path');
const os = require('os');
const { VideoProcessor } = require('../services/VideoProcessor');
const { FileService } = require('../services/FileService');
const { SystemService } = require('../services/SystemService');

class IPCManager {
  constructor(configManager) {
    this.videoProcessor = new VideoProcessor();
    this.fileService = new FileService();
    this.systemService = new SystemService();
    this.configManager = configManager;
    
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

    // New handler for selecting output directory
    ipcMain.handle('file:select-output-directory', async () => {
      const result = await dialog.showOpenDialog({
        title: 'Select Default Output Directory',
        properties: ['openDirectory']
      });

      return result.canceled ? null : result.filePaths[0];
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

    ipcMain.handle('settings:reset', () => {
      this.configManager.reset();
      return true;
    });

    ipcMain.handle('settings:export', async () => {
      try {
        const settings = this.configManager.getAll();
        const result = await dialog.showSaveDialog({
          title: 'Export Settings',
          defaultPath: `frame-evolve-settings-${new Date().toISOString().split('T')[0]}.json`,
          filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (!result.canceled) {
          const fs = require('fs').promises;
          await fs.writeFile(result.filePath, JSON.stringify(settings, null, 2));
          return result.filePath;
        }
        return null;
      } catch (error) {
        throw new Error(`Failed to export settings: ${error.message}`);
      }
    });

    ipcMain.handle('settings:import', async () => {
      try {
        const result = await dialog.showOpenDialog({
          title: 'Import Settings',
          filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          properties: ['openFile']
        });

        if (!result.canceled) {
          const fs = require('fs').promises;
          const data = await fs.readFile(result.filePaths[0], 'utf8');
          const settings = JSON.parse(data);
          
          // Apply imported settings
          for (const [key, value] of Object.entries(settings)) {
            this.configManager.set(key, value);
          }
          
          return settings;
        }
        return null;
      } catch (error) {
        throw new Error(`Failed to import settings: ${error.message}`);
      }
    });
  }

  setupSystemHandlers() {
    ipcMain.handle('system:info', async () => {
      return await this.systemService.getSystemInfo();
    });

    ipcMain.handle('system:version', () => {
      return process.versions;
    });

    ipcMain.handle('system:open-path', async (event, filePath) => {
      try {
        // Open the containing folder and select the file
        const directory = path.dirname(filePath);
        await shell.openPath(directory);
        return true;
      } catch (error) {
        console.error('Failed to open path:', error);
        return false;
      }
    });

    ipcMain.handle('system:get-default-paths', () => {
      return {
        home: os.homedir(),
        desktop: path.join(os.homedir(), 'Desktop'),
        documents: path.join(os.homedir(), 'Documents'),
        downloads: path.join(os.homedir(), 'Downloads'),
        videos: path.join(os.homedir(), 'Videos')
      };
    });

    // Battery status for laptops
    ipcMain.handle('system:battery-status', async () => {
      try {
        // This is a placeholder - actual battery detection would require native modules
        return {
          charging: true,
          level: 100,
          isLaptop: process.platform !== 'linux' // Rough detection
        };
      } catch (error) {
        return { charging: true, level: 100, isLaptop: false };
      }
    });

    // Performance monitoring
    ipcMain.handle('system:performance', () => {
      const usage = process.cpuUsage();
      const memory = process.memoryUsage();
      
      return {
        cpu: usage,
        memory: {
          used: memory.heapUsed,
          total: memory.heapTotal,
          external: memory.external,
          rss: memory.rss
        },
        uptime: process.uptime()
      };
    });
  }
}

module.exports = { IPCManager };
