<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup"; // optional
import Row from "primevue/row"; // optional
import { computed, onMounted, ref } from "vue";
import { bookingApi } from "../api/booking-api";
import Button from "primevue/button";
import { useQuery } from "@tanstack/vue-query";
import { smsApi } from "../api/sms-api";

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

const getData = async () => {
  spacesData.value = await bookingApi.getSpaces(parkingId);
  const { data: dataSessions } = await bookingApi.getSessionsLockers(parkingId);
  sessionsData.value = dataSessions;

  if (!sessionsData?.value?.length) return;
  spacesData.value.map((el) => {
    console.log(el);
    const session = sessionsData.value.find((session) => {
      return session.space_id === el.id;
    });
    console.log(session, "session");
    if (session) {
      el.session_id = session.id;
      el.session_status = session.status;
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

const enableLocker = async (id) => {
  await bookingApi.enableLocker(id);
  await getData();
};
const disableLocker = async (id) => {
  await bookingApi.disableLocker(id);
  await getData();
};
const tableData = computed(() => {
  if (!spacesData?.value?.length) return [];
  return spacesData.value.map((el) => {
    return {
      ...el,
    };
  });
});
const finishSession = async (sessionId) => {
  const result = await bookingApi.finishSession(sessionId, "lockers");
  await getData();
};
const finishPayment = async (paymentId, status) => {
  const result = await bookingApi.finishPayment(paymentId, status);
  await getData();
};

const clearPlace = async (placeId) => {
  const result = await smsApi.clearPlace(placeId);
  await getData();
};

const downLocker = async (placeId) => {
  const result = await smsApi.downLocker(placeId);
  await getData();
};

const resetAll = async () => {
  const result = await bookingApi.resetAll();
  await getData();
};

onMounted(async () => {
  await getData();
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
    <Column field="name" header="Name"> </Column>
    <!-- <Column field="status" header="Status"></Column> -->
    <Column field="status" header="Status"> </Column>
    <Column field="features" header="Features"></Column>
    <Column field="group_id" header="Group"></Column>
    <Column field="session_status" header="Session status">
      <template #body="slotProps">
        <span v-if="slotProps.data?.session_status">
          {{ slotProps.data.session_status }}</span
        >

        <span v-else> No active </span>
      </template>
    </Column>
    <Column field="payment_id" header="Payment ID"> </Column>

    <Column field="payment_status" header="Payment Type"> </Column>
    <Column field="payment_status" header="Controls">
      <template #body="slotProps">
        <Button
          v-if="slotProps.data?.payment_id && slotProps.data.payment_status"
          label="Finish payment"
          @click="finishPayment(slotProps.data.payment_id)"
        ></Button>
        <span v-else> </span>
        <Button
          v-if="slotProps.data?.session_status"
          label="Cancel session"
          @click="finishSession(slotProps.data.session_id)"
        ></Button>
        <span v-else> </span>
        <Button
          v-if="slotProps.data?.status === 'disabled'"
          label="Enable Locker"
          @click="enableLocker(slotProps.data?.id)"
        ></Button>
        <Button
          v-else-if="slotProps.data?.status === 'open'"
          label="Disable Locker"
          @click="disableLocker(slotProps.data?.id)"
        ></Button>
        <span v-else> </span>
        <Button label="Reset place" @click="clearPlace(slotProps.data?.id)">
        </Button>
        <Button label="Down Locker" @click="downLocker(slotProps.data?.id)">
        </Button>
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
