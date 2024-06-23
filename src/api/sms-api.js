import axios from "axios";
// import { useBookingUserStore } from '@/stores/bookingUserStore.js';

const sms = axios.create({
  // baseURL: `http://localhost:9090/`,

  baseURL: `https://pccwlck.urbanpass.world/api/sms`,
  // baseURL: `http://localhost:9090/`,
  crossDomain: true,
});

export const smsApi = {
  clearPlace: async (id) => {
    const response = await sms.post(`space/${id}/update`, {
      status: "open",
    });
    return response.data;
  },
  downLocker: async (id) => {
    const response = await sms.post(`space/${id}/update`, {
      status: "occupy",
    });
    return response.data;
  },
};
