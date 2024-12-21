const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fileURLToPath } = require('url');

// Define __filename and __dirname for ES Modules
if (typeof __filename === 'undefined' || typeof __dirname === 'undefined') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.resolve(path.dirname(''));
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../src/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const viteDevServerURL = process.env.VITE_DEV_SERVER_URL;
    if (viteDevServerURL) {
        console.log('Chargement de Vite URL:', viteDevServerURL);
        mainWindow.loadURL(viteDevServerURL);
    } else {
        const filePath = path.join(__dirname, '../dist/index.html');
        console.log('Chargement de fichier HTML:', filePath);
        mainWindow.loadFile(filePath);
    }
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
