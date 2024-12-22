<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <!-- HEADER -->
    <header class="bg-blue-900 text-white flex justify-between items-center px-6 py-3">
      <h1 class="text-xl font-bold">NanoGlobin</h1>
      <div class="flex items-center space-x-2">
        <input
          type="file"
          accept=".ngb"
          @change="onFileChange"
          class="text-sm file:mr-2 file:py-1 file:px-3 file:border-none file:rounded file:bg-gray-200 file:text-gray-800 file:cursor-pointer file:shadow-sm"
        />
        <button @click="analyzeFile" class="btn-primary">Analyse</button>
        <button @click="showMetadata = true" class="btn-secondary">Access Metadata</button>
      </div>
    </header>

    <!-- MAIN : 2 colonnes -->
    <main class="flex flex-1">
      <div
        id="gel-container"
        class="p-6 border-r border-gray-300 bg-white w-1/2 max-w-2xl"
      >
        <h2 class="text-lg font-semibold mb-3">Gel Virtuel</h2>
        <GelVirtuel :samples="computedGelSamples" />
      </div>

      <div id="genotype-container" class="p-6 flex flex-col bg-white w-1/2">
        <h2 class="text-lg font-semibold mb-3">Tableau Genotype</h2>
        <BarcodeTable :barcodes="barcodes" @action-barcode="handleBarcodeAction" />

        <div id="variant-container" class="mt-6">
          <h2 class="text-lg font-semibold mb-2">Variantes</h2>
          <table class="min-w-full border border-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th class="border px-4 py-2 text-left">Chromosome</th>
                <th class="border px-4 py-2 text-left">Position</th>
                <th class="border px-4 py-2 text-left">Reference</th>
                <th class="border px-4 py-2 text-left">Alternate</th>
                <th class="border px-4 py-2 text-left">Quality</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(v, i) in variants"
                :key="i"
                class="hover:bg-gray-50 even:bg-gray-50/50"
              >
                <td class="border px-4 py-2">{{ v.chrom }}</td>
                <td class="border px-4 py-2">{{ v.pos }}</td>
                <td class="border px-4 py-2">{{ v.ref }}</td>
                <td class="border px-4 py-2">{{ v.alt }}</td>
                <td class="border px-4 py-2">{{ v.qual }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- FOOTER -->
    <footer class="bg-blue-900 flex justify-end p-3">
      <button id="exportButton" @click="exportReport" class="btn-danger">
        Export Report
      </button>
    </footer>

    <!-- MODAL Metadonnées -->
    <div
      v-if="showMetadata"
      class="fixed inset-0 flex items-center justify-center z-50"
    >
      <div
        class="absolute inset-0 bg-black bg-opacity-50"
        @click="showMetadata = false"
      ></div>
      <div class="relative bg-white rounded shadow-lg p-6 w-1/2">
        <h2 class="text-xl font-bold mb-3">Metadata Informations</h2>
        <p v-if="!metadata">Aucune donnée disponible pour l'instant.</p>
        <div v-else>
          <p><strong>Taille du fichier :</strong> {{ metadata.size }} octets</p>
          <p class="mt-2">
            <strong>Barcodes détectés :</strong>
            {{ metadata.barcodes.join(', ') }}
          </p>
        </div>
        <div class="flex justify-end mt-6">
          <button class="btn-secondary" @click="showMetadata = false">Fermer</button>
        </div>
      </div>
    </div>

    <!-- LOADER -->
    <div
      v-if="loading"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl"
    >
      Chargement en cours...
    </div>
  </div>
</template>

<script>
import GelVirtuel from "./GelVirtuel.vue";
import BarcodeTable from "./BarcodeTable.vue";

export default {
  name: "Home",
  components: { GelVirtuel, BarcodeTable },
  data() {
    return {
      showMetadata: false,
      loading: false,
      metadata: null,
      barcodes: {},
      variants: [],
    };
  },
  computed: {
    computedGelSamples() {
      return Object.values(this.barcodes).map(
        (b) => "size\n" + (b.lengthData || []).join("\n")
      );
    },
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const fileBuffer = new Uint8Array(reader.result);
        window.api
          .loadNGBFile(null, fileBuffer)
          .then((data) => {
            this.barcodes = data.barcodes;
            this.metadata = {
              size: fileBuffer.length,
              barcodes: Object.keys(data.barcodes),
            };
          })
          .catch((err) => {
            console.error("Erreur parse NGB:", err);
            alert("Impossible de parser le fichier .ngb");
          });
      };
      reader.readAsArrayBuffer(file);
    },
    analyzeFile() {
      console.log("Analyze button clicked");
    },
    handleBarcodeAction(barcode) {
      console.log("Action sur barcode:", barcode);
    },
    exportReport() {
      alert("Export not implemented yet!");
    },
  },
};
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded;
}
.btn-secondary {
  @apply bg-gray-300 hover:bg-gray-400 text-black font-semibold py-1 px-3 rounded;
}
.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded;
}
</style>
