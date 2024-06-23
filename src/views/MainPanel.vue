<script setup>
import Button from "primevue/button";
// const count = ref(0);
</script>

<template>
  <router-link to="/"><Button>Lockers</Button></router-link>
  <router-link to="/chargers"><Button>Chargers</Button></router-link>
  <router-view></router-view>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
.p-button {
  margin-right: 50px;
}
</style>
