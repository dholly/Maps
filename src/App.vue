<script setup>
import { onMounted, ref } from "vue";
import { bookingApi } from "./api/booking-api";
import LoginPage from "./views/LoginPage.vue";
import MainPanel from "./views/MainPanel.vue";
const userId = ref(0);
onMounted(async () => {
  const user = await bookingApi.userMe();
  userId.value = user?.Id;
  console.log(user);
});
</script>

<template>
  <LoginPage v-if="!userId" />
  <MainPanel v-else />
</template>

<style scoped></style>
