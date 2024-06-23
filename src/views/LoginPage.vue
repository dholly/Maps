<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>
        <h1 class="login-title">Login</h1>
      </template>

      <template #content>
        <div class="p-fluid">
          <div class="p-field">
            <label for="username">Username</label>
            <InputText v-model="username" id="username" />
          </div>
          <div class="p-field">
            <label for="password">Password</label>
            <Password v-model="password" :feedback="false" />
          </div>
          <Button label="Login" @click="login" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { bookingApi } from "../api/booking-api";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");

const login = async () => {
  const response = await bookingApi.login(username.value, password.value);
  await nextTick();
  window.location.reload();
};
const register = async () => {
  const response = await bookingApi.register(username.value, password.value);
  console.log(response);
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  width: 300px;
}

.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
}
</style>
