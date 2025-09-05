const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { PythonShell } = require('python-shell');

// Keep a global reference of the window object
let mainWindow;

const isDev = process.env.ELECTRON_IS_DEV === '1';

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.png'),
    titleBarStyle: 'hiddenInset'
  });

  // Load the Next.js app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the 'out' directory
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Python-related IPC handlers
const pythonPath = path.join(__dirname, '../../dynamic-model-api');

// Handle model training
ipcMain.handle('train-model', async (event, config) => {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered stdout
      scriptPath: pythonPath,
      args: [JSON.stringify(config)]
    };

    const pyshell = new PythonShell('train_wrapper.py', options);
    let results = '';

    pyshell.on('message', (message) => {
      // Send progress updates to the renderer
      try {
        const data = JSON.parse(message);
        if (data.type === 'progress') {
          event.sender.send('training-progress', data);
        } else if (data.type === 'result') {
          results = data.data;
        }
      } catch (e) {
        console.log('Python output:', message);
      }
    });

    pyshell.on('error', (err) => {
      console.error('Python error:', err);
      reject(err);
    });

    pyshell.on('close', () => {
      resolve(results);
    });
  });
});

// Handle notebook generation
ipcMain.handle('generate-notebook', async (event, config) => {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: pythonPath,
      args: [JSON.stringify(config)]
    };

    const pyshell = new PythonShell('generate_wrapper.py', options);
    let results = '';

    pyshell.on('message', (message) => {
      console.log('Generate output:', message);
      results += message + '\n';
    });

    pyshell.on('error', (err) => {
      console.error('Generate error:', err);
      reject(err);
    });

    pyshell.on('close', () => {
      resolve({ success: true, output: results });
    });
  });
});

// Handle file downloads/saves
ipcMain.handle('save-file', async (event, defaultPath, data) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultPath,
      filters: [
        { name: 'Jupyter Notebooks', extensions: ['ipynb'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      const fs = require('fs');
      fs.writeFileSync(result.filePath, data);
      return { success: true, filePath: result.filePath };
    }
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Save file error:', error);
    return { success: false, error: error.message };
  }
});

// Health check for Python environment
ipcMain.handle('check-python-health', async () => {
  return new Promise((resolve) => {
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: pythonPath,
    };

    const pyshell = new PythonShell('health_check.py', options);
    let output = '';

    pyshell.on('message', (message) => {
      output += message;
    });

    pyshell.on('error', (err) => {
      resolve({ status: 'error', message: err.message });
    });

    pyshell.on('close', () => {
      resolve({ status: 'online', message: output });
    });
  });
});
