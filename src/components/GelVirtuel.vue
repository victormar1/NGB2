<template>
  <div class="flex flex-col items-center">
    <!-- Sélecteur de profil témoin -->
    <div class="mb-4">
      <label class="text-gray-700 mr-2">Profil témoin :</label>
      <select v-model="selectedProfile" @change="drawGel" class="border rounded p-1">
        <option value="normal">αα/αα, β/β (Normal)</option>
        <option value="--SEA">--SEA/αα, β/β</option>
        <option value="-α3.7">-α3.7/αα, β/β</option>
        <option value="-α4.2">-α4.2/αα, β/β</option>
        <option value="--THAI">--THAI/αα, β/β</option>
        <option value="--FIL">--FIL/αα, β/β</option>
        <option value="-α27.6">-α27.6/αα, β/β</option>
        <option value="ααanti3.7">ααanti3.7/αα, β/β</option>
        <option value="ααanti4.2">ααanti4.2/αα, β/β</option>
        <option value="βSEA-HPFH">αα/αα, βSEA-HPFH/β</option>
        <option value="βGγ+(Aγδβ)0">αα/αα, βGγ+(Aγδβ)0/β</option>
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
      ladderSpacing: 150,
      sampleSpacing: 30,
      minSize: 500,
      maxSize: 15000,
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

      const { canvasWidth, canvasHeight, ladderSpacing, sampleSpacing } = this;

      // Nettoyer le canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Dessiner l'échelle
      this.drawLadder(ctx, canvasHeight);

      // Dessiner la piste témoin
      this.drawControlTracks(ctx, canvasHeight);

// Dessiner les échantillons
this.samples.forEach((sample, sampleIndex) => {
  // Accéder aux données de l'échantillon
  const parsedData = sample.data
    .split("\n")
    .slice(1)
    .map(Number)
    .filter((n) => !isNaN(n));

  if (parsedData.length === 0) return;

  const sampleWidth =
    (canvasWidth - ladderSpacing - sampleSpacing * (this.samples.length + 2)) /
    (this.samples.length + 1);

  const xOffset =
    ladderSpacing +
    sampleSpacing * 2 + // Laisser la place pour le témoin
    (sampleWidth + sampleSpacing) * (sampleIndex + 1); // Décalage du premier échantillon

  // Dessiner les bandes
  parsedData.forEach((size) => {
    if (size < this.minSize || size > this.maxSize) return;

    const yPosition =
      canvasHeight -
      ((size - this.minSize) / (this.maxSize - this.minSize)) * canvasHeight;

    ctx.fillStyle = "rgba(255, 69, 0, 0.8)";
    ctx.fillRect(xOffset, yPosition - 1, sampleWidth, 2);
  });

  // Afficher le nom sous la piste
  ctx.font = "20px Arial"; // Police plus grande
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "center";
  ctx.fillText(sample.name, xOffset + sampleWidth / 2, canvasHeight - 10);

  // Surlignage si l'échantillon est sélectionné
  if (sampleIndex === this.highlightedSample) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;
    ctx.strokeRect(xOffset - 2, 0, sampleWidth + 4, canvasHeight);
  }
});

    },
    
    drawLadder(ctx, canvasHeight) {
      const scaleStep = 1000;
      const totalSteps = Math.floor((this.maxSize - this.minSize) / scaleStep);
      ctx.fillStyle = "#FFD700";
      ctx.font = "14px Arial";

      for (let i = 0; i <= totalSteps; i++) {
        const size = this.minSize + i * scaleStep;
        const yPosition =
          canvasHeight - ((size - this.minSize) / (this.maxSize - this.minSize)) * canvasHeight;

        ctx.fillRect(this.ladderSpacing / 2 - 10, yPosition - 1, 20, 2);
        ctx.fillText(`${size} bp`, this.ladderSpacing - 10, yPosition + 4);
      }
    },
    drawControlTracks(ctx, canvasHeight) {
      const controlTracks = {
  "normal": [8300, 10300, 9500],
  "--SEA": [8300, 10300, 9500, 5000],
  "-α3.7": [8300, 10300, 9500, 4600],
  "-α4.2": [8300, 10300, 9500, 4100],
  "--THAI": [8300, 10300, 9500, 6100],
  "--FIL": [8300, 10300, 9500, 7800],
  "-α27.6": [8300, 10300, 9500, 6300],
  "ααanti3.7": [8300, 10300, 9500, 12000],
  "ααanti4.2": [8300, 10300, 9500, 12500],
  "βSEA-HPFH": [8300, 10300, 9500, 6600],
  "βGγ+(Aγδβ)0": [8300, 10300, 9500, 7400],
};


      const profile = controlTracks[this.selectedProfile];
      if (!profile) return;

      const sampleWidth =
        (this.canvasWidth -
          this.ladderSpacing -
          this.sampleSpacing * (this.samples.length + 2)) /
        (this.samples.length + 1);
      const xOffset = this.ladderSpacing + this.sampleSpacing;

      ctx.fillStyle = "#FFD700";
      profile.forEach((size) => {
        if (size < this.minSize || size > this.maxSize) return;

        const yPosition =
          canvasHeight -
          ((size - this.minSize) / (this.maxSize - this.minSize)) * canvasHeight;

        ctx.fillRect(xOffset, yPosition - 1, sampleWidth, 2);
      });

      ctx.font = "20px Arial"; // Police plus grande
      ctx.fillStyle = "#FFD700";
      ctx.textAlign = "center";
      ctx.fillText("Témoin", xOffset + sampleWidth / 2, canvasHeight - 10);
    },
  },
};
</script>
