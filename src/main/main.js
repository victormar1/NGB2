import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { parseNGBFile, extractBAMAndBAIFromBuffer } from "./fileHandlers";
import express from "express";
import fs from "fs";
import os from "os";

// Handle __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// Création d'un serveur local pour servir les fichiers BAM
const appServer = express();
const tempDir = path.join(os.tmpdir(), "nanoglobin");
appServer.use("/files", express.static(tempDir));
appServer.listen(8080, () => {
  console.log("Serveur de fichiers démarré sur http://localhost:8080/files");
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../ui/index.html"));
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Gestionnaire IPC pour charger un fichier NGB
ipcMain.handle("load-ngb-file", async (event, filePath, fileBuffer) => {
  try {
    const barcodes = await parseNGBFile(filePath, fileBuffer);
    return { barcodes };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle("get-bam-url", async (event, barcode, fileBuffer) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("Le fichier NGB fourni est vide ou invalide.");
  }

  const result = await extractBAMAndBAIFromBuffer(fileBuffer, barcode);
  return result;
});
