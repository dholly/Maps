import { createWebHistory, createRouter } from "vue-router";

const LocationDetails = () => import("../views/LocationDetails.vue");
const LocationList = () => import("../views/LocationList.vue");

const LocationAll = () => import("../views/LocationAll.vue");

const AllRoutesComponent = () => import("../views/AllRoutesComponent.vue");

const RouteDetailsComponent = () => import("../views/RouteDetailsComponent.vue");

const PolygonDraw = () => import("../views/PolygonDraw.vue");

const Route = () => import("../views/Route.vue");

const Home = () => import("../views/Home.vue");

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    props: true
  },
  {
    path: '/location-map/',
    name: 'LocationList',
    component: LocationList,
    props: true
  },
  {
    path: '/locations/:id',
    name: 'LocationDetails',
    component: LocationDetails,
    props: true
  },
  {
    path: '/locations/',
    name: 'LocationAll',
    component: LocationAll,
    props: true
  },
  {
    path: '/route-draw/',
    name: 'Route',
    component: Route,
    props: true
  },
  {
    path: '/routes/',
    name: 'AllRoutes',
    component: AllRoutesComponent,
    props: true
  },
  {
    path: '/routes/:id/',
    name: 'RouteDetails',
    component: RouteDetailsComponent,
    props: true
  },
  {
    path: '/polygondraw/',
    name: 'PolygonDraw',
    component: PolygonDraw,
    props: true
  }
];

export const router = createRouter({

  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
});
