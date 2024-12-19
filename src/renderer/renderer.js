import { displayGelVirtuel } from './GelVirtuel.js';
import { populateBarcodeTable } from './BarcodeTable.js';
import { displayMetadata } from './Metadata.js';

document.getElementById('fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const fileBuffer = new Uint8Array(reader.result);
        window.api.loadNGBFile(null, fileBuffer).then(data => {
            displayGelVirtuel(Object.values(data.barcodes).map(b => b.lengthData.join('\n')), 'gel-canvas');
            populateBarcodeTable(data.barcodes);
            displayMetadata(data);
        }).catch(console.error);
    };
    reader.readAsArrayBuffer(file);
});
