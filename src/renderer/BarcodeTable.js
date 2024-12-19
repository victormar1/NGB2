export function populateBarcodeTable(barcodes, fileBuffer) {
    const tableBody = document.querySelector('#barcode-table tbody');
    tableBody.innerHTML = ''; // Réinitialise le tableau

    // Fonction locale pour extraire le BAM
    async function extractBAMFromBuffer(buffer, barcode) {
        const zip = await JSZip.loadAsync(buffer);

        const bamPath = Object.keys(zip.files).find(
            (filePath) => filePath.startsWith(`${barcode}/`) && filePath.endsWith('.bam')
        );

        if (!bamPath) {
            throw new Error(`Aucun fichier BAM trouvé pour le barcode ${barcode}`);
        }

        const bamContent = await zip.files[bamPath].async('blob');
        const blobUrl = URL.createObjectURL(bamContent);

        console.log(`Fichier BAM extrait pour ${barcode}:`, blobUrl);
        return blobUrl; // Retourne une URL Blob
    }

    Object.entries(barcodes).forEach(([barcode, data]) => {
        const row = document.createElement('tr');

        // Colonne Barcode
        const barcodeCell = document.createElement('td');
        barcodeCell.textContent = barcode;
        row.appendChild(barcodeCell);

        // Colonne Genotype
        const genotypeCell = document.createElement('td');
        genotypeCell.textContent = data.haploContent || 'Aucune donnée';
        row.appendChild(genotypeCell);

        // Colonne Action
        const actionCell = document.createElement('td');
        if (data.bam) {
            const button = document.createElement('button');
            button.textContent = 'Visualiser IGV';
            button.style.color = '#fff';
            button.style.backgroundColor = '#3498db';
            button.style.border = 'none';
            button.style.padding = '5px 10px';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';

            button.addEventListener('click', async () => {
                try {
                    const bamPath = await extractBAMFromBuffer(fileBuffer, barcode);
                    const igvUrl = `http://127.0.0.1:60151/load?file=${encodeURIComponent(bamPath)}&locus=HBA1`;
                    fetch(igvUrl)
                        .then(response => {
                            if (response.ok) {
                                alert(`Fichier ${bamPath} chargé avec succès dans IGV.`);
                            } else {
                                alert('Échec du chargement du fichier dans IGV.');
                            }
                        })
                        .catch(error => {
                            console.error('Erreur lors de la communication avec IGV :', error);
                            alert('Impossible de charger IGV.');
                        });
                } catch (error) {
                    console.error('Erreur lors de l\'extraction ou du lancement d\'IGV :', error);
                    alert('Impossible de charger IGV.');
                }
            });

            actionCell.appendChild(button);
        } else {
            actionCell.textContent = 'BAM non disponible';
            actionCell.style.color = '#e74c3c'; // Rouge pour indiquer l'absence
        }
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}
