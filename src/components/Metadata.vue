<template>
  <div>
    <!-- Vérifie si la prop metadata est vide : -->
    <div v-if="!metadata || !Object.keys(metadata).length">
      <p>Aucune métadonnée disponible.</p>
    </div>
    <div v-else>
      <!-- Affichage classique : -->
      <p><strong>Taille du fichier :</strong> {{ metadata.size }} octets</p>
      <!-- Si tu veux la liste des barcodes au format "barcode1, barcode2" : -->
      <p><strong>Barcodes détectés :</strong> {{ detectedBarcodes }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Metadata",

  // On reçoit la prop `metadata` depuis le parent
  props: {
    metadata: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    // Transforme l'objet `metadata.barcodes` en une liste de noms
    // ex: { "barcode1": {}, "barcode2": {} } => "barcode1, barcode2"
    detectedBarcodes() {
      if (!this.metadata.barcodes || !Object.keys(this.metadata.barcodes).length) {
        return 'Aucun barcode détecté';
      }
      return Object.keys(this.metadata.barcodes).join(', ');
    },
  },
};
</script>

<style scoped>
/* Styles spécifiques à ce composant */
</style>
