// fileHandlers.js (version ESM)

import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';
import os from 'os';

const tempDir = path.join(os.tmpdir(), 'nanoglobin');

/**
 * Analyse un fichier NGB et retourne la liste des barcodes détectés
 *
 * @param {string} filePath - Chemin vers le fichier NGB (optionnel si fileBuffer est fourni)
 * @param {Buffer} fileBuffer - Contenu du fichier NGB sous forme de buffer
 * @returns {Promise<Object>} - Objet contenant la liste des barcodes et leurs infos
 */
export async function parseNGBFile(filePath, fileBuffer) {
  const buffer = fileBuffer || fs.readFileSync(filePath);
  if (!buffer || buffer.length === 0) {
    throw new Error('Le buffer est vide ou invalide.');
  }

  const zip = await JSZip.loadAsync(buffer);
  const folders = Object.keys(zip.files)
    .filter((filePath) => /^barcode\d+\//.test(filePath))
    .map((folderPath) => folderPath.split('/')[0])
    .filter((value, index, self) => self.indexOf(value) === index);

  const barcodes = {};
  for (const barcode of folders) {
    const haploPath = Object.keys(zip.files).find(
      (filePath) => filePath.startsWith(`${barcode}/`) && filePath.endsWith('haplo.csv')
    );

    let haploContent = null;
    if (haploPath) {
      haploContent = await zip.files[haploPath].async('string');
    }

    const lengthPath = Object.keys(zip.files).find(
      (filePath) => filePath.startsWith(`${barcode}/`) && filePath.includes('length.csv')
    );

    let lengthData = null;
    if (lengthPath) {
      const lengthContent = await zip.files[lengthPath].async('string');
      lengthData = lengthContent.trim().split('\n').map(Number);
    }

    barcodes[barcode] = {
      bam: Object.keys(zip.files).find(
        (filePath) => filePath.startsWith(`${barcode}/`) && filePath.endsWith('.bam')
      ) || null,
      bai: Object.keys(zip.files).find(
        (filePath) => filePath.startsWith(`${barcode}/`) && filePath.endsWith('.bai')
      ) || null,
      vcf: Object.keys(zip.files).find(
        (filePath) => filePath.startsWith(`${barcode}/`) && filePath.endsWith('.vcf')
      ) || null,
      haplo: haploPath || null,
      haploContent: haploContent || 'Aucune donnée disponible',
      length: lengthPath || null,
      lengthData: lengthData || [],
    };
  }

  return barcodes;
}

/**
 * Extrait les fichiers BAM et BAI d’un buffer NGB pour un barcode donné,
 * puis les écrit dans un répertoire temporaire accessible via http://localhost:8080/files/
 *
 * @param {Buffer} fileBuffer - Le contenu du fichier NGB sous forme de buffer
 * @param {string} barcode - Le nom du barcode (ex: "barcode1")
 * @returns {Promise<{ bamUrl: string, baiUrl: string }>} - URLs pour accéder aux fichiers BAM/BAI
 */
export async function extractBAMAndBAIFromBuffer(fileBuffer, barcode) {
  const zip = await JSZip.loadAsync(fileBuffer);
  const bamPath = Object.keys(zip.files).find(
    (filePath) => filePath.startsWith(`${barcode}/`) && filePath.endsWith('.bam')
  );
  const baiPath = Object.keys(zip.files).find(
    (filePath) => filePath.startsWith(`${barcode}/`) && filePath.endsWith('.bai')
  );

  if (!bamPath || !baiPath) {
    throw new Error(`Fichiers BAM ou BAI introuvables pour ${barcode}`);
  }

  const bamContent = await zip.files[bamPath].async('nodebuffer');
  const baiContent = await zip.files[baiPath].async('nodebuffer');

  const tempBAMPath = path.join(tempDir, `${barcode}.bam`);
  const tempBAIPath = path.join(tempDir, `${barcode}.bai`);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  fs.writeFileSync(tempBAMPath, bamContent);
  fs.writeFileSync(tempBAIPath, baiContent);

  return {
    bamUrl: `http://localhost:8080/files/${barcode}.bam`,
    baiUrl: `http://localhost:8080/files/${barcode}.bai`
  };
}
