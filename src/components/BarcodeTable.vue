<template>
  <table id="barcode-table">
    <thead>
      <tr>
        <th>Barcode</th>
        <th>Génotype</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(data, barcode) in barcodes" :key="barcode">
        <td>{{ barcode }}</td>
        <td>{{ data.haploContent || 'Aucune donnée' }}</td>
        <td>
          <button
            v-if="data.bam"
            @click="loadBamInIGV(barcode)"
            :class="buttonClasses"
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
      required: true
    }
  },
  methods: {
    async loadBamInIGV(barcode) {
      try {
        const bamUrl = await this.getBamUrl(barcode);
        const igvUrl = `http://127.0.0.1:60151/load?file=${encodeURIComponent(bamUrl)}&locus=HBA1`;

        const response = await fetch(igvUrl);
        if (response.ok) {
          alert(`Fichier BAM chargé avec succès dans IGV.`);
        } else {
          alert('Échec du chargement du fichier dans IGV.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'extraction ou du lancement d\'IGV :', error);
        alert('Impossible de charger IGV.');
      }
    },
    async getBamUrl(barcode) {
      const zip = await JSZip.loadAsync(this.fileBuffer);
      const bamPath = Object.keys(zip.files).find(
        (filePath) => filePath.startsWith(`${barcode}/`) && filePath.endsWith('.bam')
      );

      if (!bamPath) {
        throw new Error(`Aucun fichier BAM trouvé pour le barcode ${barcode}`);
      }

      const bamContent = await zip.files[bamPath].async('blob');
      return URL.createObjectURL(bamContent);
    }
  },
  computed: {
    buttonClasses() {
      return [
        'py-2',
        'px-4',
        'rounded',
        'font-bold',
        'text-white',
        'bg-blue-500',
        'hover:bg-blue-700',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-300'
      ].join(' ');
    }
  }
};
</script>

<style scoped>
#barcode-table {
  width: 100%;
  border-collapse: collapse;
}

#barcode-table th,
#barcode-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

#barcode-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}
</style>
