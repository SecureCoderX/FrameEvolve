/**
 * Window Manager - Fixed Display
 */

const { BrowserWindow, screen } = require('electron');
const path = require('path');

class WindowManager {
  constructor(configManager) {
    this.configManager = configManager;
    this.mainWindow = null;
  }

  async createMainWindow() {
    try {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      const windowConfig = this.configManager.get('window', {
        width: Math.min(1400, width * 0.8),
        height: Math.min(900, height * 0.8)
      });

      console.log('Creating window with config:', windowConfig);

      this.mainWindow = new BrowserWindow({
        width: windowConfig.width,
        height: windowConfig.height,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
          color: '#1a1a1a',
          symbolColor: '#ffffff',
          height: 40
        },
        backgroundColor: '#1a1a1a',
        show: false, // Don't show until ready
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          sandbox: false,
          preload: path.join(__dirname, '../preload/preload.js'),
          webSecurity: true
        },
        icon: path.join(__dirname, '../../../assets/icons/icon.png')
      });

      // Load the application HTML
      const htmlPath = path.join(__dirname, '../../renderer/index.html');
      console.log('Loading HTML from:', htmlPath);
      
      await this.mainWindow.loadFile(htmlPath);

      // Setup window event handlers
      this.setupWindowEvents();

      // Show window when ready
      this.mainWindow.once('ready-to-show', () => {
        console.log('Window ready to show');
        this.mainWindow.show();
        this.mainWindow.focus();
        
        if (process.env.NODE_ENV === 'development') {
          this.mainWindow.webContents.openDevTools();
        }
      });

      // Force show after timeout if needed
      setTimeout(() => {
        if (this.mainWindow && !this.mainWindow.isVisible()) {
          console.log('Force showing window...');
          this.mainWindow.show();
        }
      }, 2000);

      console.log('Window created successfully');
      return this.mainWindow;

    } catch (error) {
      console.error('Failed to create window:', error);
      throw error;
    }
  }

  setupWindowEvents() {
    if (!this.mainWindow) return;

    // Save window state on resize/move
    this.mainWindow.on('resize', () => this.saveWindowState());
    this.mainWindow.on('move', () => this.saveWindowState());

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Prevent navigation
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      event.preventDefault();
    });

    // Debug events
    this.mainWindow.on('show', () => console.log('Window shown'));
    this.mainWindow.on('hide', () => console.log('Window hidden'));
    this.mainWindow.on('focus', () => console.log('Window focused'));
  }

  saveWindowState() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    const bounds = this.mainWindow.getBounds();
    this.configManager.set('window', bounds);
  }

  getMainWindow() {
    return this.mainWindow;
  }

  focusMainWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
    }
  }
}

module.exports = { WindowManager };
