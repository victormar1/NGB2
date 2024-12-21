<template>
  <table>
    <thead>
      <tr>
        <th>Barcode</th>
        <th>Genotype</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(data, barcode) in barcodes" :key="barcode">
        <td>{{ barcode }}</td>
        <td>{{ data.genotype }}</td>
        <td>
          <button @click="viewAction(barcode)">Action</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: ['barcodes'],
  methods: {
    viewAction(barcode) {
      console.log('Action for', barcode);
    },
  },
};
</script>

<style>
/* Add Tailwind CSS styles here */
</style>
