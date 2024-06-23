<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup"; // optional
import Row from "primevue/row"; // optional
import { computed, onMounted, ref } from "vue";
import { bookingApi } from "../api/booking-api";
import Button from "primevue/button";
import { useQuery } from "@tanstack/vue-query";

defineProps({
  msg: String,
});

const parkingId = 6147;
const spaces = ref();

const test = (info) => {
  alert(info);
};

const spacesData = ref([]);
const sessionsData = ref();
const enableLocker = (id) => {
  console.log(id);
};
const tableData = computed(() => {
  if (!spacesData?.value?.length) return [];
  return spacesData.value.map((el) => {
    return {
      ...el,
    };
  });
});

const getInfo = async () => {
  spacesData.value = await bookingApi.getChargers(parkingId);

  const { data: dataSessions } = await bookingApi.getSessionsChargers(
    parkingId
  );
  sessionsData.value = dataSessions;

  if (!sessionsData?.value?.length) return;
  spacesData.value.map((el) => {
    const session = sessionsData.value.find((session) => {
      return session.space_id === el.id;
    });

    if (session) {
      el.session_id = session?.id;
      el.session_status = session?.status;
    }
    return el;
  });

  const paymentRequests = spacesData.value.map((el) => {
    return new Promise(async (resolve, reject) => {
      if (el.session_id) {
        const paymentData = await bookingApi.getPaymentInfo(el.session_id);
        if (paymentData.data) {
          el.payment_id = paymentData.data.payment_id;
          el.payment_status = paymentData.data.type;
        }
      }
      resolve(el);
    });
  });
  spacedData.value = await Promise.allSettled(paymentRequests);
};

const finishSession = async (sessionId) => {
  const result = await bookingApi.finishSession(sessionId, "chargers");
  await getInfo();
};
const finishPayment = async (paymentId, status) => {
  const result = await bookingApi.finishPayment(paymentId, status);
  await getInfo();
};
const resetAll = async () => {
  const result = await bookingApi.resetAll();
  await getInfo();
};
onMounted(async () => {
  await getInfo();
});
</script>

<template>
  <Button label="Reset All" @click="resetAll"></Button>
  <DataTable
    v-if="tableData?.length"
    :value="tableData"
    paginator
    :rows="5"
    sortable
    sortMode="multiple"
    tableStyle="min-width: 50rem"
  >
    <Column field="id" header="ID"></Column>
    <Column field="cpid" header="CPID"> </Column>
    <Column field="status" header="Status"></Column>
    <Column field="voltage" header="Voltage"></Column>
    <Column field="session_id" header="Session ID"></Column>
    <Column field="session_status" header="Session status"></Column>

    <Column field="payment_id" header="Payment ID"> </Column>
    <Column field="payment_status" header="Payment Status"></Column>

    <Column header="Controls">
      <template #body="slotProps">
        <Button
          v-if="slotProps.data?.payment_id && slotProps.data?.payment_status"
          label="Finish payment"
          @click="finishPayment(slotProps.data.payment_id)"
        ></Button>
        <span v-else> </span>
        <Button
          v-if="slotProps.data?.session_status"
          label="Close session"
          @click="finishSession(slotProps.data.session_id)"
        ></Button>
        <span v-else></span>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
.p-button {
  margin-right: 10px;
}
</style>
