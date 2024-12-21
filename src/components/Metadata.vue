
<template>
  <div>
    <p><strong>File Size:</strong> {{ metadata.size }} bytes</p>
    <p><strong>Detected Barcodes:</strong> {{ metadata.barcodes.join(', ') }}</p>
  </div>
</template>

<script>
export default {
  props: ['metadata'],
};
</script>

<style>
/* Add Tailwind CSS styles here */
</style>
