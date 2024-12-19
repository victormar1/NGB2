const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadNGBFile: async (filePath, fileBuffer) => {
        try {
            console.log('Preload - loadNGBFile appelé avec :', { filePath, fileBufferExists: !!fileBuffer });
            return await ipcRenderer.invoke('load-ngb-file', filePath, fileBuffer);
        } catch (error) {
            console.error('Error invoking loadNGBFile:', error);
            throw error;
        }
    },

    getMetadataFromFile: async (fileBuffer) => {
        try {
            return await ipcRenderer.invoke('get-metadata', fileBuffer);
        } catch (error) {
            console.error('Error invoking getMetadataFromFile:', error);
            throw error;
        }
    },


    readFile: async (filePath) => {
        try {
            return await ipcRenderer.invoke('read-file', filePath);
        } catch (error) {
            console.error('Error invoking readFile:', error);
            throw error;
        }
    },
});
