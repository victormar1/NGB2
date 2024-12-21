
<template>
  <canvas ref="canvas" style="width: 100%; height: 400px;"></canvas>
</template>

<script>
export default {
  props: ['samples'],
  mounted() {
    this.drawGel();
  },
  methods: {
    drawGel() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
  },
};
</script>

<style>
/* Add Tailwind CSS styles here */
</style>
