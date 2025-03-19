const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const { initializeDatabase, closeDatabase } = require('./database.js');
const { setupIpcHandlers } = require('./ipc-handlers.js');

// Global window reference
let mainWindow;

// Simple logging
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
  try {
    fs.appendFileSync(
      path.join(app.getPath('userData'), 'app-log.txt'),
      `[${new Date().toISOString()}] ${message}\n`
    );
  } catch (err) {
    console.error('Failed to write to log:', err);
  }
}

// Setup IPC handlers - THIS IS CRITICAL
log('Setting up IPC handlers');
setupIpcHandlers();

async function createWindow() {
  log('Creating window...');
  
  try {
    // Initialize database
    log('Initializing database...');
    await initializeDatabase();
    log('Database initialized');
  } catch (dbError) {
    log(`Database initialization error: ${dbError}`);
  }
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minHeight: 600,
    minWidth: 1024,
    show: false, // Don't show until loaded
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  
  // Find a valid HTML file to load
  let htmlPath;
  const possiblePaths = [
    path.join(__dirname, '../build/index.html'),
    path.join(__dirname, '../public/index.html'),
    path.join(app.getAppPath(), 'build/index.html')
  ];
  
  for (const p of possiblePaths) {
    log(`Checking path: ${p}`);
    if (fs.existsSync(p)) {
      htmlPath = p;
      log(`Found HTML at: ${p}`);
      break;
    }
  }
  
  if (!htmlPath) {
    log('No HTML file found, creating emergency file');
    htmlPath = path.join(app.getPath('temp'), 'emergency.html');
    fs.writeFileSync(htmlPath, `
      <!DOCTYPE html>
      <html>
        <head><title>Expense Tracker</title></head>
        <body>
          <h1>Expense Tracker</h1>
          <p>Error: Unable to load application HTML</p>
        </body>
      </html>
    `);
  }
  
  // Load the index.html
  log(`Loading URL: file://${htmlPath}`);
  mainWindow.loadFile(htmlPath);
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    log('Window ready, showing now');
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });
  
  // Force show after timeout as fallback
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      log('Force showing window after timeout');
      mainWindow.show();
    }
  }, 5000);
  
  mainWindow.on('closed', function () {
    log('Window closed');
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  log('App ready');
  createWindow();
  
  app.on('activate', function () {
    if (mainWindow === null) createWindow();
  });
}).catch(err => {
  log(`App ready error: ${err}`);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  log('All windows closed');
  if (process.platform !== 'darwin') {
    closeDatabase();
    app.quit();
  }
});

// Close database when quitting
app.on('will-quit', () => {
  log('App will quit, closing database');
  closeDatabase();
});

// Handle exceptions
process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err}\n${err.stack}`);
});