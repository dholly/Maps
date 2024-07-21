import {createApp} from "vue";
import {createPinia} from "pinia";
import {router} from "./router";
import {VueQueryPlugin} from "@tanstack/vue-query";
import {createYmaps} from 'vue-yandex-maps';
import PrimeVue from "primevue/config";
import App from "./App.vue";
import "normalize.css";
import '@fontsource-variable/ruda';


import "./style.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primevue/resources/themes/aura-light-green/theme.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(createYmaps({
  apikey: '058ef1b5-f5f0-49f0-bbd3-ac017e494f36',
}));

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  },
});
app.use(PrimeVue);

app.mount("#app");

