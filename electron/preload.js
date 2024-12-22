// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", {
  loadNGBFile: (filePath, fileBuffer) => {
    return ipcRenderer.invoke("load-ngb-file", filePath, fileBuffer)
  },
  getBAMUrl: (barcode, fileBuffer) => {
    return ipcRenderer.invoke("get-bam-url", barcode, fileBuffer)
  },
})
