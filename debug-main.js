/**
 * Debug Main - Forces window visibility
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  console.log('Creating debug window...');
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true, // Show frame for debugging
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/main/preload/preload.js')
    },
    show: true
  });

  // Load main app
  win.loadFile('src/renderer/index.html');
  
  // Always open dev tools
  win.webContents.openDevTools();
  
  console.log('Debug window created');
});
