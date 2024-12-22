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
        v-for="(data, barcode) in barcodes"
        :key="barcode"
        class="hover:bg-gray-50"
      >
        <td class="border px-3 py-1">{{ barcode }}</td>
        <td class="border px-3 py-1">{{ data.haploContent || 'Aucune donnée' }}</td>
        <td class="border px-3 py-1">
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
import JSZip from 'jszip'

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
      // Ex: si tu appelles un IPC ou un "getBAMUrl"
      alert(`TODO: load ${barcode} in IGV...`)
    }
  }
}
</script>

<style scoped>
/* On réutilise les mêmes classes "btn-primary" si tu veux : */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded;
}
</style>
