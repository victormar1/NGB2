export function populateBarcodeTable(barcodes) {
    const tableBody = document.querySelector('#barcode-table tbody');
    tableBody.innerHTML = ''; // Réinitialise le tableau

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

        // Colonne Action avec lien IGV
        const actionCell = document.createElement('td');
        const igvLink = document.createElement('a');
        igvLink.href = `http://localhost:60151/load?file=${data.bam}&locus=HBA1`; // URL IGV
        igvLink.target = '_blank'; // Ouvre dans un nouvel onglet
        igvLink.textContent = 'Voir dans IGV';
        igvLink.style.textDecoration = 'none';
        igvLink.style.color = '#3498db';
        igvLink.style.fontWeight = 'bold';
        actionCell.appendChild(igvLink);

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}
