<!-- components/PaymentResult.vue -->
<template>
  <div>
    <h2>Payment Result</h2>
    <p>{{ paymentStatus }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useYooKassa } from '../composables/useYooKassa';

const route = useRoute();
const { checkPaymentStatus } = useYooKassa();

const paymentStatus = ref('Checking payment status...');

onMounted(async () => {
  const paymentId = route.query.payment_id;
  if (paymentId) {
    try {
      const status = await checkPaymentStatus(paymentId);
      paymentStatus.value = `Payment status: ${status}`;
    } catch (error) {
      paymentStatus.value = 'Failed to check payment status';
    }
  } else {
    paymentStatus.value = 'No payment ID provided';
  }
});
</script>