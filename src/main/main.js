/**
 * Frame Evolve - Main Process Entry Point (Fixed)
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

// Import modules
const { WindowManager } = require('./managers/WindowManager');
const { MenuManager } = require('./managers/MenuManager');
const { IPCManager } = require('./managers/IPCManager');
const { ConfigManager } = require('./config/ConfigManager');
const { LogManager } = require('./services/LogManager');

class FrameEvolveApp {
  constructor() {
    this.windowManager = null;
    this.menuManager = null;
    this.ipcManager = null;
    this.configManager = null;
    this.logger = null;
    
    this.init();
  }

  init() {
    this.setupLogger();
    this.setupConfig();
    this.setupEventHandlers();
  }

  setupLogger() {
    this.logger = new LogManager();
    this.logger.info('Frame Evolve starting...');
  }

  setupConfig() {
    this.configManager = new ConfigManager();
  }

  setupEventHandlers() {
    app.whenReady().then(() => this.onReady());
    app.on('window-all-closed', () => this.onWindowAllClosed());
    app.on('activate', () => this.onActivate());
    app.on('before-quit', () => this.onBeforeQuit());
  }

  async onReady() {
    try {
      this.logger.info('App ready, initializing managers...');
      
      this.windowManager = new WindowManager(this.configManager);
      this.menuManager = new MenuManager();
      this.ipcManager = new IPCManager(this.configManager); // Pass config manager

      await this.windowManager.createMainWindow();
      this.menuManager.setupMenu();
      
      this.logger.info('Frame Evolve initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize app:', error);
      app.quit();
    }
  }

  onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  onActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
      this.windowManager?.createMainWindow();
    }
  }

  onBeforeQuit() {
    this.logger.info('Frame Evolve shutting down...');
    this.configManager?.save();
  }
}

new FrameEvolveApp();
