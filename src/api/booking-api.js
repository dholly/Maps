import axios from "axios";
// import { useBookingUserStore } from '@/stores/bookingUserStore.js';

const booking = axios.create({
  // baseURL: `http://localhost:9090/`,

  baseURL: `https://pccwlck.urbanpass.world/api/booking`,
  // baseURL: `http://localhost:9090/`,
  crossDomain: true,
});

export const bookingQueries = {
  FEATURES: "features",
  SPACES: "spaces",
  SESSION: "session",
  SESSIONS: "sessions",
  PAYMENT: "payment",
};
export const bookingApi = {
  login: async (login, password) => {
    try {
      // eslint-disable-next-line camelcase
      const response = await booking.post(`user/login`, {
        email: login,
        password: password,
      });
      return response.data;
    } catch (error) {
      throw error.response;
    }
  },
  register: async (login, password) => {
    try {
      // eslint-disable-next-line camelcase
      const response = await booking.post(`user/register`, {
        email: login,
        password: password,
      });
      return response.data;
    } catch (error) {
      throw error.response;
    }
  },
  getSpaces: async (parkingId) => {
    try {
      const response = await booking.get("spaces/", {
        params: {
          parkId: parkingId,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
  getSessionsLockers: async (parkingId) => {
    try {
      const response = await booking.get("/admin/sessions/lockers");
      return response;
    } catch (error) {
      console.error(error);
    }
  },
  getChargers: async (parkingId) => {
    try {
      const response = await booking.get("/admin/chargers");
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
  getSessionsChargers: async (parkingId) => {
    try {
      const response = await booking.get("/admin/sessions/chargers");
      return response;
    } catch (error) {
      console.error(error);
    }
  },

  finishSession: async (sessionID, type) => {
    try {
      const response = await booking.post(
        `admin/sessions/${type}/cancel/${sessionID}`
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  },
  finishPayment: async (sessionID) => {
    try {
      const response = await booking.post(`admin/payments/confirm`, {
        paymentId: sessionID,
        event: "captured",
      });
      console.log(response, "are we here???");
      return response;
    } catch (error) {
      console.error(error);
    }
  },
  getPaymentInfo: async (sessionID) => {
    try {
      const response = await booking.get(`admin/payments/${sessionID}`);
      return response;
    } catch (error) {
      console.error(error);
    }
  },
  cameraMock: () => {},
  enableLocker: async (spaceID) => {
    try {
      const response = await booking.post(`admin/spaces/${spaceID}/enable`);
      return response;
    } catch (error) {
      console.error(error);
    }
  },
  disableLocker: async (spaceID) => {
    try {
      const response = await booking.post(`admin/spaces/${spaceID}/disable`);
      return response;
    } catch (error) {
      console.error(error);
    }
  },
  resetAll: async () => {
    try {
      const response = await booking.post("admin/sessions/reset");
      return response;
    } catch (error) {
      console.error(error);
    }
  },
  userMe: async () => {
    const response = await booking.get("user/me");
    return response.data;
  },
};

booking.interceptors.response.use(
  async (response) => {
    if (response.data && response.data.token) {
      const { token } = response.data;
      localStorage.setItem("booking-auth-token", token);
      booking.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { authUser } = useBookingUserStore();
      authUser();
    }
    return response;
  },
  (error) => {
    // Handle any errors
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);
booking.interceptors.request.use((config) => {
  const token = localStorage.getItem("booking-auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.params = {
    ...config.params,
  };
  return config;
});
