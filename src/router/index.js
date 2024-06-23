import { createWebHistory, createRouter } from "vue-router";
const LockersPage = () => import("../views/LockersPage.vue");
const ChargersPage = () => import("../views/ChargersPage.vue");

const HomeView = () => import("../views/MainPanel.vue");
const LoginPage = () => import("../views/LoginPage.vue");

const routes = [
  { path: "/", component: LockersPage },
  { path: "/chargers", component: ChargersPage },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
