import { app, BrowserWindow, ipcMain } from "electron"
import path from "path"
import { fileURLToPath } from "url"
import express from "express"
import fs from "fs"
import os from "os"
import { parseNGBFile, extractBAMAndBAIFromBuffer } from "./fileHandlers.js"

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Détection du mode (dev ou prod)
const isDev = process.env.NODE_ENV === "development"

let mainWindow

// ────────────── Serveur local pour les fichiers BAM ──────────────
const appServer = express()
const tempDir = path.join(os.tmpdir(), "nanoglobin")
appServer.use("/files", express.static(tempDir))
appServer.listen(8080, () => {
  console.log("Serveur de fichiers démarré sur http://localhost:8080/files")
})

// ────────────── Création de la fenêtre Electron ──────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Activer le preload pour exposer window.api
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
  })

  if (isDev) {
    // En dev, on pointe vers l'URL Vite
    mainWindow.loadURL("http://localhost:5173")
    mainWindow.webContents.openDevTools()
  } else {
    // En prod, on charge le fichier dist/index.html
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"))
  }
}

// ────────────── Cycle de vie de l'app Electron ──────────────
app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// ────────────── IPC Handlers ──────────────
ipcMain.handle("load-ngb-file", async (event, filePath, fileBuffer) => {
  try {
    const barcodes = await parseNGBFile(filePath, fileBuffer)
    return { barcodes }
  } catch (error) {
    throw error
  }
})

ipcMain.handle("get-bam-url", async (event, barcode, fileBuffer) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("Le fichier NGB fourni est vide ou invalide.")
  }
  return extractBAMAndBAIFromBuffer(fileBuffer, barcode)
})
