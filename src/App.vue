<template>
  <div id="app">
    <GelVirtuel :samples="samples" />
    <BarcodeTable :barcodes="barcodes" />
    <Metadata :metadata="metadata" />
  </div>
</template>

<script>
import GelVirtuel from './components/GelVirtuel.vue';
import BarcodeTable from './components/BarcodeTable.vue';
import Metadata from './components/Metadata.vue';

export default {
  components: { GelVirtuel, BarcodeTable, Metadata },
  data() {
    return {
      samples: [
        { size: 500 }, { size: 1000 }, { size: 1500 }, { size: 2000 }
      ],
      barcodes: {
        "barcode1": { genotype: "AA" },
        "barcode2": { genotype: "BB" }
      },
      metadata: {
        size: 12345,
        barcodes: ["barcode1", "barcode2"]
      },
    };
  },
};
</script>

<style>
/* Add styles if necessary */
</style>
