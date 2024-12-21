import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  loadNGBFile: async (filePath, fileBuffer) => {
    return await ipcRenderer.invoke("load-ngb-file", filePath, fileBuffer);
  },
  getBAMUrl: async (barcode, fileBuffer) => {
    return await ipcRenderer.invoke("get-bam-url", barcode, fileBuffer);
  },
});
