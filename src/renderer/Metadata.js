export function displayMetadata(metadata) {
    const metadataContainer = document.getElementById('metadata-content');
    if (!metadataContainer) {
        console.error("L'élément avec l'ID 'metadata-content' est introuvable.");
        return;
    }

    if (!metadata || Object.keys(metadata).length === 0) {
        metadataContainer.innerHTML = '<p>Aucune métadonnée disponible.</p>';
        return;
    }

    metadataContainer.innerHTML = `
        <p><strong>Taille du fichier :</strong> ${metadata.size} octets</p>
        <p><strong>Barcodes détectés :</strong> ${Object.keys(metadata.barcodes).join(', ')}</p>
    `;
}
