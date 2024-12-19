const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');
const os = require('os');

// Fonction pour analyser un fichier NGB
async function parseNGBFile(filePath, fileBuffer) {
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

// Fonction pour extraire un BAM depuis le buffer
async function extractBAMFromBuffer(fileBuffer, barcode) {
    const zip = await JSZip.loadAsync(fileBuffer);

    const bamPath = Object.keys(zip.files).find(
        (filePath) => filePath.startsWith(`${barcode}/`) && filePath.endsWith('.bam')
    );

    if (!bamPath) {
        throw new Error(`Aucun fichier BAM trouvé pour le barcode ${barcode}`);
    }

    const bamContent = await zip.files[bamPath].async('nodebuffer');
    const tempDir = path.join(os.tmpdir(), 'nanoglobin');
    const tempBAMPath = path.join(tempDir, `${barcode}.bam`);

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(tempBAMPath, bamContent);
    console.log(`Fichier BAM extrait : ${tempBAMPath}`);
    return tempBAMPath;
}

module.exports = { parseNGBFile, extractBAMFromBuffer };

