const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { parseNGBFile, extractBAMFromBuffer } = require('./fileHandlers');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../ui/index.html'));
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Gestionnaire IPC pour charger un fichier NGB
ipcMain.handle('load-ngb-file', async (event, filePath, fileBuffer) => {
    try {
        console.log('load-ngb-file appelé avec :', { filePath, fileBufferExists: !!fileBuffer });
        const barcodes = await parseNGBFile(filePath, fileBuffer);
        return { barcodes };
    } catch (error) {
        console.error('Erreur lors du chargement du fichier NGB :', error);
        throw error;
    }
});

// Gestionnaire IPC pour extraire un fichier BAM
ipcMain.handle('extract-bam', async (event, fileBuffer, barcode) => {
    try {
        return await extractBAMFromBuffer(fileBuffer, barcode);
    } catch (error) {
        console.error('Erreur lors de l\'extraction du fichier BAM :', error);
        throw error;
    }
});
