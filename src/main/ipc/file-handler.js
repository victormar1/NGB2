
const fs = require('fs');
const JSZip = require('jszip');

async function parseNGBFile(filePath) {
    const zip = await JSZip.loadAsync(fs.readFileSync(filePath));
    const metadata = await zip.file('metadata.json').async('string');
    return JSON.parse(metadata);
}

module.exports = { parseNGBFile };
