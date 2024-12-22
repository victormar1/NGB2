<template>
  <div class="flex flex-col items-center">
    <!-- Le canvas s’adapte en largeur max, mais fixe la résolution interne -->
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      class="max-w-full border border-gray-300 shadow-md"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "GelVirtuel",

  props: {
    /**
     *  `samples` est un tableau de chaînes.
     *  Exemple : [ "size\n600\n800\n1200", "size\n700\n900\n..." ]
     */
    samples: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      // Dimensions internes du canvas
      canvasWidth: 1600,
      canvasHeight: 800,

      // Paramètres de "displayGelVirtuel"
      ladderSpacing: 100,
      sampleSpacing: 30,
      minSize: 500,
      maxSize: 15000,
      binSize: 250,
    };
  },

  mounted() {
    this.drawGel(); // Dessin initial
  },

  watch: {
    // Quand la prop samples change, on redessine
    samples() {
      this.drawGel();
    },
  },

  methods: {
    drawGel() {
      // Récupérer le contexte 2D
      const canvas = this.$refs.canvas;
      if (!canvas) return; // sécurité
      const ctx = canvas.getContext("2d");

      // Quelques alias pour plus de lisibilité
      const { canvasWidth, canvasHeight } = this;
      const { ladderSpacing, sampleSpacing, minSize, maxSize, binSize } = this;

      // Nettoyage du canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Fond noir
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calcul du nombre total de bins
      const totalBins = (maxSize - minSize) / binSize;

      // ÉCHELLE (ladder) sur la gauche, en jaune
      ctx.fillStyle = "#FFD700";
      for (let i = 0; i <= totalBins; i++) {
        const yPosition = canvasHeight - (i / totalBins) * canvasHeight;
        // Petite barre horizontale
        ctx.fillRect(ladderSpacing / 2 - 10, yPosition - 1, 20, 2);

        // Label du nombre de bp (en blanc)
        ctx.font = "14px Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText(`${minSize + i * binSize} bp`, 5, yPosition + 4);

        // On repasse en doré pour la prochaine barre
        ctx.fillStyle = "#FFD700";
      }

      // Dessiner une colonne pour chaque échantillon de `samples`
      this.samples.forEach((sampleData, sampleIndex) => {
        // Ex: on saute la 1ère ligne (souvent "size") et on parse en nombres
        const parsedData = sampleData
          .split("\n")
          .slice(1)
          .map(Number)
          .filter((n) => !isNaN(n));

        if (parsedData.length === 0) return;

        // Création d'un tableau de bins (compteurs) initialisés à 0
        const bins = Array.from({ length: totalBins + 1 }, () => 0);

        // Répartition des valeurs dans les bins
        parsedData.forEach((size) => {
          if (size >= minSize && size <= maxSize) {
            const binIndex = Math.floor((size - minSize) / binSize);
            bins[binIndex] += 1;
          }
        });

        // Calcul de la largeur de chaque colonne
        const sampleWidth =
          (canvasWidth -
            ladderSpacing -
            sampleSpacing * (this.samples.length + 1)) /
          this.samples.length;

        // Position X pour cet échantillon
        const xOffset =
          ladderSpacing +
          sampleSpacing +
          sampleIndex * (sampleWidth + sampleSpacing);

        // Trouver le nombre maximum de reads dans un bin (pour l'intensité)
        const maxReads = Math.max(...bins);

        // Dessiner chaque bin sous forme de bande horizontale
        bins.forEach((count, binIndex) => {
          if (count === 0) return;

          const intensity = Math.min(0.1 + (count / maxReads) * 0.9, 1);
          const yPosition = canvasHeight - (binIndex / totalBins) * canvasHeight;

          // Dégradé orange->red
          const gradient = ctx.createLinearGradient(
            xOffset,
            yPosition,
            xOffset + sampleWidth,
            yPosition
          );
          gradient.addColorStop(0, `rgba(255, 165, 0, ${intensity})`); // orange
          gradient.addColorStop(1, `rgba(255, 69, 0, ${intensity})`);  // orangered
          ctx.fillStyle = gradient;

          // Bande horizontale
          ctx.fillRect(xOffset, yPosition - 1, sampleWidth, 2);
        });

        // Ajouter la légende (“Sample 1”, etc.) en bas
        ctx.font = "14px Arial";
        ctx.fillStyle = "#FFD700";
        ctx.fillText(`Sample ${sampleIndex + 1}`, xOffset, canvasHeight - 10);
      });
    },
  },
};
</script>

<style scoped>
/* Styles complémentaires si besoin. 
   On a déjà .max-w-full, .border, .shadow-md dans le <canvas> via classes Tailwind. */
</style>
