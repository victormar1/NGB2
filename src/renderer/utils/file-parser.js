
const JSZip = require('jszip');

async function readNGBFile(file) {
    const zip = await JSZip.loadAsync(file);
    const metadata = await zip.file('metadata.json').async('string');
    const barcodes = JSON.parse(metadata).barcodes;
    if (!barcodes || !Array.isArray(barcodes)) {
        throw new Error('Invalid .ngb file format: missing or incorrect barcodes.');
    }
    return { barcodes };
}

module.exports = { readNGBFile };
