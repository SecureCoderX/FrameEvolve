/**
 * Frame Evolve - Main Process with Splash Screen
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
      this.logger.info('App ready, initializing with splash screen...');
      
      // Initialize managers
      this.windowManager = new WindowManager(this.configManager);
      this.menuManager = new MenuManager();
      this.ipcManager = new IPCManager(this.configManager);

      // Show splash screen first
      await this.windowManager.createSplashScreen();
      
      // Simulate initialization time (adjust as needed)
      await this.initializeApp();
      
      // Create main window (this will auto-close splash when ready)
      await this.windowManager.createMainWindow();
      
      // Setup application menu
      this.menuManager.setupMenu();
      
      this.logger.info('Frame Evolve initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize app:', error);
      // Close splash on error
      if (this.windowManager) {
        this.windowManager.closeSplash();
      }
      app.quit();
    }
  }

  /**
   * Simulate app initialization with realistic timing
   */
  async initializeApp() {
    // Simulate various initialization steps
    const steps = [
      { name: 'Loading configuration', delay: 200 },
      { name: 'Checking FFmpeg availability', delay: 300 },
      { name: 'Initializing services', delay: 400 },
      { name: 'Loading user preferences', delay: 200 },
      { name: 'Preparing interface', delay: 300 }
    ];

    for (const step of steps) {
      this.logger.info(`Initialization: ${step.name}`);
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    // Additional delay to show the splash screen properly
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  onActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
      // If no windows, start with splash again
      this.onReady();
    }
  }

  onBeforeQuit() {
    this.logger.info('Frame Evolve shutting down...');
    this.configManager?.save();
    
    // Ensure splash is closed
    if (this.windowManager) {
      this.windowManager.closeSplash();
    }
  }
}

new FrameEvolveApp();
