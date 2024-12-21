import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import fs from "fs";
import os from "os";
import { parseNGBFile, extractBAMAndBAIFromBuffer } from "./fileHandlers.js";

// Handle __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Détection du mode (production ou développement)
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

// ──────────────────────────────────────────────────────────
// Création d'un serveur local pour servir les fichiers BAM
// ──────────────────────────────────────────────────────────
const appServer = express();
const tempDir = path.join(os.tmpdir(), "nanoglobin");
appServer.use("/files", express.static(tempDir));
appServer.listen(8080, () => {
  console.log("Serveur de fichiers démarré sur http://localhost:8080/files");
});

// ──────────────────────────────────────────────────────────
// Création de la fenêtre principale
// ──────────────────────────────────────────────────────────
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

  if (isDev) {
    // En DEV : charger l’URL du serveur Vite
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools(); // Facultatif
  } else {
    // En PROD : charger le bundle Vite (index.html dans dist)
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// ──────────────────────────────────────────────────────────
// Événements Electron (app Ready, etc.)
// ──────────────────────────────────────────────────────────
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ──────────────────────────────────────────────────────────
// Gestionnaires IPC
// ──────────────────────────────────────────────────────────

// Charger un fichier NGB
ipcMain.handle("load-ngb-file", async (event, filePath, fileBuffer) => {
  try {
    const barcodes = await parseNGBFile(filePath, fileBuffer);
    return { barcodes };
  } catch (error) {
    throw error;
  }
});

// Extraction BAM/BAI en mémoire
ipcMain.handle("get-bam-url", async (event, barcode, fileBuffer) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("Le fichier NGB fourni est vide ou invalide.");
  }

  const result = await extractBAMAndBAIFromBuffer(fileBuffer, barcode);
  return result;
});
