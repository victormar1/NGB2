<template>
  <!-- On délègue toute la page à un composant "Home" -->
  <Home />
</template>

<script>
import Home from './components/Home.vue'

export default {
  name: 'App',
  components: {
    Home
  }
}
</script>

<style>
/* Styles globaux ou rien, selon ton organisation */
</style>
