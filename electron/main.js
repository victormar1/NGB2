import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import fs from "fs";
import os from "os";
import { parseNGBFile } from "./fileHandlers.js";

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Détection du mode (dev ou prod)
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

// ────────────── Serveur local pour les fichiers BAM ──────────────
const appServer = express();
const tempDir = path.join(os.tmpdir(), "nanoglobin");

// Ajout de logs pour vérifier le répertoire et les requêtes
appServer.use((req, res, next) => {
  console.log(`Requête reçue : ${req.method} ${req.url}`);
  console.log(`Répertoire servi : ${tempDir}`);
  next();
});

// Middleware pour servir les fichiers du répertoire temporaire
appServer.use("/files", express.static(tempDir));

// Test d'accès à tempDir pour détecter d'éventuelles erreurs
if (!fs.existsSync(tempDir)) {
  console.error(`Le répertoire ${tempDir} n'existe pas. Création en cours...`);
  fs.mkdirSync(tempDir, { recursive: true });
} else {
  console.log(`Répertoire ${tempDir} trouvé.`);
}

// Démarrage du serveur
appServer.listen(8080, () => {
  console.log("Serveur de fichiers démarré sur http://localhost:8080/files");
});

// ────────────── Création de la fenêtre Electron ──────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Activer le preload pour exposer window.api
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // En dev, on pointe vers l'URL Vite
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // En prod, on charge le fichier dist/index.html
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// ────────────── Cycle de vie de l'app Electron ──────────────
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ────────────── IPC Handlers ──────────────
ipcMain.handle("load-ngb-file", async (event, filePath, fileBuffer) => {
  try {
    console.log(`Chargement du fichier NGB : ${filePath}`);
    const barcodes = await parseNGBFile(filePath, fileBuffer);

    // Ajout de logs pour confirmer les fichiers extraits
    console.log("Barcodes extraits :", barcodes);
    Object.keys(barcodes).forEach((barcode) => {
      console.log(`Fichiers pour ${barcode} :`, barcodes[barcode]);
    });

    return { barcodes };
  } catch (error) {
    console.error("Erreur lors du chargement du fichier NGB :", error);
    throw error;
  }
});
