/**
 * Window Manager - Test Version
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
      console.log('Creating test window...');

      this.mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#0f0f0f',
        show: true, // Show immediately for testing
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, '../preload/preload.js')
        }
      });

      // Load simple test HTML
      const htmlPath = path.join(__dirname, '../../renderer/index-simple.html');
      console.log('Loading simple HTML from:', htmlPath);
      
      await this.mainWindow.loadFile(htmlPath);
      
      // Open dev tools for debugging
      this.mainWindow.webContents.openDevTools();

      console.log('Test window created and shown');
      return this.mainWindow;

    } catch (error) {
      console.error('Failed to create test window:', error);
      throw error;
    }
  }

  getMainWindow() {
    return this.mainWindow;
  }
}

module.exports = { WindowManager };
