import { displayGelVirtuel } from './GelVirtuel.js';
import { populateBarcodeTable } from './BarcodeTable.js';
import { displayMetadata } from './Metadata.js';

let fileBufferGlobal = null;

document.getElementById('fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        fileBufferGlobal = new Uint8Array(reader.result);

        window.api.loadNGBFile(null, fileBufferGlobal).then(data => {
            displayGelVirtuel(
                Object.values(data.barcodes).map(b => b.lengthData.join('\n')),
                'gel-canvas'
            );
            populateBarcodeTable(data.barcodes, fileBufferGlobal);
            displayMetadata(data);
        });
    };

    reader.readAsArrayBuffer(file);
});

button.addEventListener('click', async () => {
    try {
        const { bamUrl, baiUrl } = await window.api.getBAMUrl(barcode, fileBufferGlobal);
        const igvUrl = `http://127.0.0.1:60151/load?file=${encodeURIComponent(bamUrl)}&index=${encodeURIComponent(baiUrl)}&locus=HBA1`;

        fetch(igvUrl).then(response => {
            if (response.ok) alert('Fichiers BAM et BAI chargés avec succès dans IGV.');
        });
    } catch (error) {
        alert('Erreur : Impossible de charger les fichiers dans IGV.');
    }
});
