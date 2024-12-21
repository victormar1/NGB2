
export function displayGelVirtuel(allSamples, canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const canvasWidth = 1600; // Augmenté pour une meilleure résolution
    const canvasHeight = 800;
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const ladderSpacing = 100; // Espace pour l'échelle
    const sampleSpacing = 30; // Espace entre les colonnes
    const sampleWidth = (canvasWidth - ladderSpacing - (sampleSpacing * (allSamples.length + 1))) / allSamples.length;

    const minSize = 500; // Ajusté pour les nouvelles valeurs de longueur
    const maxSize = 15000; // Ajusté pour les nouvelles valeurs de longueur
    const binSize = 250; // Taille des bins ajustée pour couvrir l'étendue
    const totalBins = (maxSize - minSize) / binSize;

    // Fond du gel
    ctx.fillStyle = '#000'; // Fond noir
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Échelle sur la gauche
    ctx.fillStyle = '#FFD700'; // Jaune doré
    for (let i = 0; i <= totalBins; i++) {
        const yPosition = canvasHeight - (i / totalBins) * canvasHeight;
        ctx.fillRect(ladderSpacing / 2 - 10, yPosition - 1, 20, 2);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${minSize + i * binSize} bp`, 5, yPosition + 4);
    }

    // Colonnes pour chaque échantillon
    allSamples.forEach((sampleData, sampleIndex) => {
        const parsedData = sampleData.split('\n').slice(1).map(Number).filter(n => !isNaN(n));
        if (parsedData.length === 0) return;

        const bins = Array.from({ length: totalBins + 1 }, () => 0);
        parsedData.forEach(size => {
            if (size >= minSize && size <= maxSize) {
                const binIndex = Math.floor((size - minSize) / binSize);
                bins[binIndex] += 1;
            }
        });

        const xOffset = ladderSpacing + sampleSpacing + sampleIndex * (sampleWidth + sampleSpacing);
        const maxReads = Math.max(...bins);

        bins.forEach((count, binIndex) => {
            if (count === 0) return;

            const intensity = Math.min(0.1 + (count / maxReads) * 0.9, 1);
            const yPosition = canvasHeight - (binIndex / totalBins) * canvasHeight;

            // Dégradé pour les bandes
            const gradient = ctx.createLinearGradient(xOffset, yPosition, xOffset + sampleWidth, yPosition);
            gradient.addColorStop(0, `rgba(255, 165, 0, ${intensity})`);
            gradient.addColorStop(1, `rgba(255, 69, 0, ${intensity})`);
            ctx.fillStyle = gradient;

            ctx.fillRect(xOffset, yPosition - 1, sampleWidth, 2); // Bandes plus fines
        });

        // Ajouter les étiquettes des échantillons
        ctx.font = '14px Arial';
        ctx.fillStyle = '#FFD700'; // Jaune doré
        ctx.fillText(`Sample ${sampleIndex + 1}`, xOffset, canvasHeight - 10);
    });
}
