/**
 * Window Manager - Fixed Window Display
 */

const { BrowserWindow, screen } = require('electron');
const path = require('path');

class WindowManager {
  constructor(configManager) {
    this.configManager = configManager;
    this.mainWindow = null;
    this.splashWindow = null;
  }

  /**
   * Create splash screen first
   */
  async createSplashScreen() {
    try {
      console.log('Creating splash screen...');

      this.splashWindow = new BrowserWindow({
        width: 600,
        height: 400,
        frame: false,
        alwaysOnTop: true,
        transparent: false, // Changed to false for better visibility
        resizable: false,
        center: true, // Auto-center
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true
        },
        show: true // Show immediately for debugging
      });

      // Load splash screen
      const splashPath = path.join(__dirname, '../../renderer/splash.html');
      console.log('Loading splash from:', splashPath);
      await this.splashWindow.loadFile(splashPath);

      // Force center and show
      this.splashWindow.center();
      this.splashWindow.show();
      this.splashWindow.focus();

      console.log('Splash screen created and shown');
      return this.splashWindow;
    } catch (error) {
      console.error('Failed to create splash screen:', error);
      // Don't throw error, continue without splash
      return null;
    }
  }

  /**
   * Create main window with safe positioning
   */
  async createMainWindow() {
    try {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
      
      // Calculate safe window size
      const windowWidth = Math.min(1400, Math.floor(screenWidth * 0.8));
      const windowHeight = Math.min(900, Math.floor(screenHeight * 0.8));
      
      // Calculate centered position
      const x = Math.floor((screenWidth - windowWidth) / 2);
      const y = Math.floor((screenHeight - windowHeight) / 2);

      console.log('Screen dimensions:', { screenWidth, screenHeight });
      console.log('Window dimensions:', { windowWidth, windowHeight });
      console.log('Window position:', { x, y });

      this.mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: x,
        y: y,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#1a1a1a',
        show: true, // Show immediately for debugging
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          sandbox: false,
          preload: path.join(__dirname, '../preload/preload.js'),
          webSecurity: true
        }
      });

      // Load the main application
      const startUrl = path.join(__dirname, '../../renderer/index.html');
      console.log('Loading main HTML from:', startUrl);
      
      await this.mainWindow.loadFile(startUrl);

      // Setup window event handlers
      this.setupWindowEvents();

      // Force show and focus
      this.mainWindow.show();
      this.mainWindow.focus();

      // Open dev tools in development
      if (process.env.NODE_ENV === 'development') {
        this.mainWindow.webContents.openDevTools();
      }

      // Close splash after main window is ready
      setTimeout(() => {
        this.closeSplash();
      }, 2000);

      console.log('Main window created and shown successfully');
      return this.mainWindow;

    } catch (error) {
      console.error('Failed to create main window:', error);
      this.closeSplash();
      throw error;
    }
  }

  /**
   * Close splash screen
   */
  closeSplash() {
    if (this.splashWindow && !this.splashWindow.isDestroyed()) {
      console.log('Closing splash screen...');
      try {
        this.splashWindow.close();
        this.splashWindow = null;
        console.log('Splash screen closed');
      } catch (error) {
        console.error('Error closing splash:', error);
      }
    }
  }

  setupWindowEvents() {
    if (!this.mainWindow) return;

    // Save window state on resize/move (with bounds checking)
    this.mainWindow.on('resize', () => this.saveWindowState());
    this.mainWindow.on('move', () => this.saveWindowState());

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      this.closeSplash();
    });

    // Prevent navigation
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      event.preventDefault();
    });

    // Debug events
    this.mainWindow.on('show', () => console.log('Main window shown'));
    this.mainWindow.on('hide', () => console.log('Main window hidden'));
    this.mainWindow.on('focus', () => console.log('Main window focused'));

    // Handle window ready
    this.mainWindow.webContents.once('did-finish-load', () => {
      console.log('Main window content loaded');
    });
  }

  saveWindowState() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    try {
      const bounds = this.mainWindow.getBounds();
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
      
      // Only save if window is within screen bounds
      if (bounds.x >= 0 && bounds.y >= 0 && 
          bounds.x + bounds.width <= screenWidth && 
          bounds.y + bounds.height <= screenHeight) {
        this.configManager.set('window', bounds);
        console.log('Window state saved:', bounds);
      } else {
        console.log('Window out of bounds, not saving state');
      }
    } catch (error) {
      console.error('Error saving window state:', error);
    }
  }

  getMainWindow() {
    return this.mainWindow;
  }

  getSplashWindow() {
    return this.splashWindow;
  }

  focusMainWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  toggleMaximize() {
    if (!this.mainWindow) return;
    
    if (this.mainWindow.isMaximized()) {
      this.mainWindow.unmaximize();
    } else {
      this.mainWindow.maximize();
    }
  }

  minimize() {
    if (this.mainWindow) {
      this.mainWindow.minimize();
    }
  }

  close() {
    this.closeSplash();
    if (this.mainWindow) {
      this.mainWindow.close();
    }
  }
}

module.exports = { WindowManager };
