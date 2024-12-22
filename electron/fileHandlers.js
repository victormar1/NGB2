// electron/fileHandlers.js (ESM)
import fs from 'fs'
import JSZip from 'jszip'
import path from 'path'
import os from 'os'

const tempDir = path.join(os.tmpdir(), 'nanoglobin')

// 1) parseNGBFile
export async function parseNGBFile(filePath, fileBuffer) {
    const buffer = fileBuffer || fs.readFileSync(filePath);
    if (!buffer || buffer.length === 0) {
      throw new Error('Le buffer est vide ou invalide.');
    }
  
    const zip = await JSZip.loadAsync(buffer);
    const folders = Object.keys(zip.files)
      .filter((file) => /^barcode\d+\//.test(file))
      .map((folderPath) => folderPath.split('/')[0])
      .filter((value, index, self) => self.indexOf(value) === index);
  
    const barcodes = {};
    for (const barcode of folders) {
      const haploPath = Object.keys(zip.files).find(
        (file) => file.startsWith(`${barcode}/`) && file.endsWith('haplo.csv')
      );
  
      let haploContent = null;
      if (haploPath) {
        haploContent = await zip.files[haploPath].async('string');
      }
  
      const lengthPath = Object.keys(zip.files).find(
        (file) => file.startsWith(`${barcode}/`) && file.includes('length.csv')
      );
  
      let lengthData = null;
      if (lengthPath) {
        const lengthContent = await zip.files[lengthPath].async('string');
        lengthData = lengthContent.trim().split('\n').map(Number);
      }
  
      barcodes[barcode] = {
        bam: Object.keys(zip.files).find(
          (f) => f.startsWith(`${barcode}/`) && f.endsWith('.bam')
        ) || null,
        bai: Object.keys(zip.files).find(
          (f) => f.startsWith(`${barcode}/`) && f.endsWith('.bai')
        ) || null,
        vcf: Object.keys(zip.files).find(
          (f) => f.startsWith(`${barcode}/`) && f.endsWith('.vcf')
        ) || null,
        haplo: haploPath || null,
        haploContent: haploContent || 'Aucune donnée disponible',
        length: lengthPath || null,
        lengthData: lengthData || [],
      };
    }
  
    // **Extraction des fichiers dans le répertoire temporaire**
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  
    for (const fileName of Object.keys(zip.files)) {
      const filePath = path.join(tempDir, fileName);
      if (zip.files[fileName].dir) {
        // Si c'est un dossier, créez-le
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath, { recursive: true });
        }
      } else {
        // Si c'est un fichier, écrivez-le
        const fileContent = await zip.files[fileName].async('nodebuffer');
        const dirName = path.dirname(filePath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        fs.writeFileSync(filePath, fileContent);
      }
    }
  
    return barcodes;
  }
  


// 3) readNGBFile (optionnel, si tu l'utilises)
export async function readNGBFile(file) {
  const zip = await JSZip.loadAsync(file)
  const metadata = await zip.file('metadata.json').async('string')
  const { barcodes } = JSON.parse(metadata)
  if (!barcodes || !Array.isArray(barcodes)) {
    throw new Error('Invalid .ngb file format: missing or incorrect barcodes.')
  }
  return { barcodes }
}
