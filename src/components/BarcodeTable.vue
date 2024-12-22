<template>
  <table
    class="w-full border border-gray-300 text-sm"
    id="barcode-table"
  >
    <thead class="bg-gray-50">
      <tr>
        <th class="border px-3 py-2 text-left">Barcode</th>
        <th class="border px-3 py-2 text-left">Génotype</th>
        <th class="border px-3 py-2 text-left">Action</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(data, barcode, index) in barcodes"
        :key="barcode"
        class="hover:bg-gray-50"
      >
        <!-- Colonnes cliquables -->
        <td
          class="border px-3 py-1 cursor-pointer"
          @click="$emit('select-barcode', index)"
        >
          {{ barcode }}
        </td>
        <td
          class="border px-3 py-1 cursor-pointer"
          @click="$emit('select-barcode', index)"
        >
          {{ data.haploContent || 'Aucune donnée' }}
        </td>
        <!-- Actions -->
        <td class="border px-3 py-1 flex items-center space-x-2">
          <button
            v-if="data.bam"
            @click="loadBamInIGV(barcode)"
            class="btn-primary"
          >
            Visualiser IGV
          </button>
          <span v-else class="text-red-500">BAM non disponible</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: "BarcodeTable",
  props: {
    barcodes: {
      type: Object,
      required: true
    },
    fileBuffer: {
      type: ArrayBuffer,
      required: false
    }
  },
  methods: {
  async loadBamInIGV(barcode) {
    const igvURL = "http://localhost:60151"; // Serveur IGV
    const basePath = "http://localhost:8080/files"; // Serveur Express
    const genome = "hg38"; // Génome de référence
    const locus = "chr16:167000-190000"; // Région initiale à afficher

    // URLs des fichiers BAM et BAI
    const bamUrl = `${basePath}/${barcode}/${barcode}.bam`;
    const baiUrl = `${basePath}/${barcode}/${barcode}.bam.bai`;

    try {
      // Loguer la requête pour vérifier les paramètres
      console.log(`Requête IGV : ${igvURL}/load?file=${encodeURIComponent(bamUrl)}&index=${encodeURIComponent(baiUrl)}&genome=${genome}&locus=${locus}`);

      // Envoyer la requête à IGV
      const response = await fetch(
        `${igvURL}/load?file=${encodeURIComponent(bamUrl)}&index=${encodeURIComponent(baiUrl)}&genome=${genome}&locus=${locus}`
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP IGV: ${response.status}`);
      }

      alert(`Fichier ${bamUrl} chargé dans IGV.`);
    } catch (error) {
      console.error("Erreur lors de la communication avec IGV :", error);
      alert(`Échec du chargement dans IGV pour ${barcode}.`);
    }
  },
}


};
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
