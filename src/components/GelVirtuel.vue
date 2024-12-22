<template>
  <div class="flex flex-col items-center">
    <!-- Sélecteur de profil témoin -->
    <div class="mb-4">
      <label class="text-gray-700 mr-2">Profil témoin :</label>
      <select v-model="selectedProfile" @change="drawGel" class="border rounded p-1">
        <option value="normal">Normal</option>
        <option value="-3.7">-3.7</option>
        <option value="other">Autre anomalie (placeholder)</option>
      </select>
    </div>

    <!-- Canvas -->
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
    samples: {
      type: Array,
      default: () => [],
    },
    highlightedSample: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      canvasWidth: 1600,
      canvasHeight: 800,
      ladderSpacing: 150, // Augmenté pour l'échelle et les pistes témoins
      sampleSpacing: 30,
      minSize: 500,
      maxSize: 15000,
      binSize: 250, // Taille des bins (inchangée)
      scaleStep: 1000, // Graduation de l'échelle en bp
      selectedProfile: "normal", // Profil témoin sélectionné
    };
  },
  watch: {
    samples() {
      this.drawGel();
    },
    highlightedSample() {
      this.drawGel();
    },
  },
  mounted() {
    this.drawGel();
  },
  methods: {
    drawGel() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      const { canvasWidth, canvasHeight } = this;
      const { ladderSpacing, sampleSpacing, minSize, maxSize, binSize, scaleStep } =
        this;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const totalBins = (maxSize - minSize) / binSize;
      const totalScaleSteps = Math.floor((maxSize - minSize) / scaleStep);

      // Dessiner l'échelle indépendante
      this.drawLadder(ctx, canvasHeight, totalScaleSteps, scaleStep);

      // Dessiner les pistes témoins
      this.drawControlTracks(ctx, canvasHeight);

      // Dessiner les échantillons
      this.samples.forEach((sampleData, sampleIndex) => {
        const parsedData = sampleData
          .split("\n")
          .slice(1)
          .map(Number)
          .filter((n) => !isNaN(n));

        if (parsedData.length === 0) return;

        const sampleWidth =
          (canvasWidth -
            ladderSpacing -
            sampleSpacing * (this.samples.length + 1)) /
          this.samples.length;
        const xOffset =
          ladderSpacing +
          sampleSpacing +
          sampleIndex * (sampleWidth + sampleSpacing);

        const maxReads = Math.max(...parsedData);

        parsedData.forEach((size) => {
          if (size < minSize || size > maxSize) return;

          // Position relative (précise) entre minSize et maxSize
          const yPosition =
            canvasHeight -
            ((size - minSize) / (maxSize - minSize)) * canvasHeight;

          const intensity = Math.min(0.1 + (size / maxReads) * 0.9, 1);

          const gradient = ctx.createLinearGradient(
            xOffset,
            yPosition,
            xOffset + sampleWidth,
            yPosition
          );
          gradient.addColorStop(0, `rgba(255, 165, 0, ${intensity})`);
          gradient.addColorStop(1, `rgba(255, 69, 0, ${intensity})`);
          ctx.fillStyle = gradient;

          ctx.fillRect(xOffset, yPosition - 1, sampleWidth, 2);
        });

        // Highlight de l'échantillon sélectionné
        if (sampleIndex === this.highlightedSample) {
          ctx.strokeStyle = "cyan";
          ctx.lineWidth = 4;
          ctx.strokeRect(xOffset - 2, 0, sampleWidth + 4, canvasHeight);
        }

        ctx.font = "14px Arial";
        ctx.fillStyle = "#FFD700";
        ctx.fillText(`Sample ${sampleIndex + 1}`, xOffset, canvasHeight - 10);
      });
    },
    drawLadder(ctx, canvasHeight, totalScaleSteps, scaleStep) {
      ctx.fillStyle = "#FFD700";
      ctx.font = "16px Arial"; // Texte plus lisible
      ctx.textAlign = "right";

      for (let i = 0; i <= totalScaleSteps; i++) {
        const size = this.minSize + i * scaleStep;
        const yPosition =
          canvasHeight - ((size - this.minSize) / (this.maxSize - this.minSize)) * canvasHeight;

        // Barre de l'échelle
        ctx.fillRect(this.ladderSpacing / 2 - 10, yPosition - 1, 20, 2);

        // Texte
        ctx.fillStyle = "#fff";
        ctx.fillText(`${size} bp`, this.ladderSpacing - 10, yPosition + 4);
        ctx.fillStyle = "#FFD700";
      }
    },
    drawControlTracks(ctx, canvasHeight) {
      const controlTracks = {
        normal: [700, 900, 1200],
        "-3.7": [600, 800, 1000],
        other: [500, 700, 1100], // Placeholder
      };

      const profile = controlTracks[this.selectedProfile];
      if (!profile) return;

      const controlWidth = 50; // Largeur fixe des pistes témoins
      const xOffset = this.ladderSpacing - controlWidth - 10;

      ctx.fillStyle = "#FFD700";
      profile.forEach((size) => {
        const yPosition =
          canvasHeight -
          ((size - this.minSize) / (this.maxSize - this.minSize)) * canvasHeight;

        // Bande témoin
        ctx.fillRect(xOffset, yPosition - 1, controlWidth, 2);
      });

      // Légende des témoins
      ctx.font = "14px Arial";
      ctx.fillStyle = "#FFD700";
      ctx.textAlign = "center";
      ctx.fillText(this.selectedProfile, xOffset + controlWidth / 2, canvasHeight - 10);
    },
  },
};
</script>
