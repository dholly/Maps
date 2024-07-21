<script setup>
import {ref, computed, shallowRef} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {routes} from '@/data/routes.js';
import {locations} from '@/data/locations.js';
import {customization} from "@/data/map-styles.js";
import LocationOrange from "@/assets/svg/location-orange.vue";
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapControls,
  YandexMapZoomControl,
  YandexMapFeature,
  YandexMapMarker,
  YandexMapControlButton,
  YandexMapClusterer,
} from 'vue-yandex-maps';
import Finish from "@/assets/svg/finish.vue";
import LocationNumbered from "@/assets/svg/location-numbered.vue";

const route = useRoute();
const router = useRouter();
const map = shallowRef(null);
const clusterer = shallowRef(null); // Реф для хранения экземпляра кластеризатора
const isFullscreen = ref(false);
const mapWidth = ref('100%');
const mapHeight = ref('621px');

const selectedRoute = ref(null);

const currentRoute = computed(() => routes.find(r => r.id === Number(route.params.id)));


const ZOOM_RANGE = {min: 12, max: 20};




const LOCATION = computed(() => ({
  center: currentRoute.value?.coordinates[0] || [84.9843, 56.5060],
  zoom: 14
}));

const gridSize = ref(128); // Размер сетки для кластеризации (2^6)

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  // Реализуйте здесь логику полноэкранного режима
};

const goBack = () => router.push('/routes/');

const getPointCoordinates = (point) => point.coordinates;

const navigateToLocation = (locationTitle) => {
  const location = locations.find(loc => loc.title === locationTitle);
  if (location) {
    router.push({name: 'LocationDetails', params: {id: location.id}});
  } else {
    console.error(`Локация не найдена: ${locationTitle}`);
  }
};

const getImageUrl = (imageName) => {
  const defaultImageName = 'template-photo.png';
  const imagePath = imageName || defaultImageName;

  try {
    return new URL(`/src/assets/images/${imagePath}`, import.meta.url).href;
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    return new URL(`/src/assets/images/${defaultImageName}`, import.meta.url).href;
  }
};

</script>

<template>
  <div v-if="currentRoute" class="route-details">
    <div class="back-button">
      <button @click="goBack">← Все маршруты</button>
    </div>

    <h2>{{ currentRoute.name }}</h2>
    <div class="route-map">
      <yandex-map
          v-model="map"
          :settings="{ location: LOCATION, showScaleInCopyrights: true, zoomRange: ZOOM_RANGE }"
          :height="mapHeight"
          :width="mapWidth"
      >
        <yandex-map-default-scheme-layer :settings="{ customization }"/>
        <yandex-map-default-features-layer/>
        <yandex-map-controls :settings="{ position: 'left' }">
          <yandex-map-control-button :settings="{ onClick: toggleFullscreen }">
            <div :class="{ 'exit-fullscreen': isFullscreen }">
              <ymaps class="ymaps3x0--zoom-fullscreen__in"></ymaps>
            </div>
          </yandex-map-control-button>
          <yandex-map-zoom-control/>
        </yandex-map-controls>

        <yandex-map-feature
            :settings="{
              geometry: { type: 'LineString', coordinates: currentRoute.coordinates },
              style: { stroke: [{ color: currentRoute.color, width: 2 }] },
            }"
        />

        <!-- Кластеризатор для группировки маркеров -->
        <yandex-map-clusterer
            v-model="clusterer"
            :grid-size="gridSize"
            zoom-on-cluster-click
        >
          <yandex-map-marker
              v-for="(point, index) in currentRoute.pointsOfInterest"
              :key="`route-marker-${index}`"
              :settings="{
                coordinates: getPointCoordinates(point),
                onClick: () => navigateToLocation(point.title)
              }"
          >
            <div class="pin-wrap">
              <div class="location-numbered">
                <location-numbered :number="index + 1"/>
              </div>
              <div class="pin-text">
                <div class="tag">{{ point.title }}</div>
                <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 15L9 8C9 8 4.12419 3.73367 0.999999 1" stroke="#2C2C2C" stroke-width="1.5"
                        stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </yandex-map-marker>
          <!-- Шаблон для отображения кластера -->
          <template #cluster>
            <div class="cluster">
              <location-orange/>
            </div>
          </template>
        </yandex-map-clusterer>

        <yandex-map-marker
            :settings="{
              coordinates: currentRoute.coordinates[currentRoute.coordinates.length - 1],
            }"
        >
          <div class="finish">
            <finish/>
          </div>
        </yandex-map-marker>
        <yandex-map-marker
            :settings="{
              coordinates: currentRoute.coordinates[0],
            }"
        >
          <div class="finish">
            <finish/>
          </div>
        </yandex-map-marker>
      </yandex-map>
    </div>

    <div class="route-card">
      <div class="route-info">
        <p><strong>Описание:</strong> {{ currentRoute.description }}</p>
        <p><strong>Продолжительность:</strong> {{ currentRoute.duration }}</p>
        <p><strong>Расстояние:</strong> {{ currentRoute.distance }}</p>
        <p><strong>Район:</strong> {{ currentRoute.district }}</p>
        <p><strong>Лайки:</strong> {{ currentRoute.likes }}</p>
        <p><strong>Создан:</strong> {{ currentRoute.createdAt }}</p>
      </div>
      <h3>Точки маршрута:</h3>
      <ul>
        <li v-for="(point, index) in currentRoute.pointsOfInterest" :key="index">
          {{ point.title }}
        </li>
      </ul>
    </div>

    <div v-if="currentRoute.steps" class="route-steps">
      <h2>{{ currentRoute.name }} - Шаги маршрута</h2>
      <div class="steps-container">
        <div v-for="(step, index) in currentRoute.steps" :key="index" class="step-card">
          <img :src="getImageUrl(step.imageUrl)" :alt="step.title">
          <div class="step-info">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.location-numbered {
  transform: translate(-42px, -43px);
}

.finish {
  transform: translate(-6.5px, -6.5px);
}

.route-details {
  margin-top: 30px;
}

.back-button button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.route-map {
  height: 621px;
  margin-bottom: 20px;
}

.route-info {
  margin-bottom: 20px;
}

.route-actions {
  margin-bottom: 20px;
}

.route-actions button {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pin-wrap {
  position: relative;
  cursor: pointer;
}

.pin-wrap svg {
  position: relative;
  z-index: 1;
}

.pin-text {
  position: absolute;
  top: -6px;
  left: -5px;
  opacity: 0;
  visibility: hidden;
  width: 225px;
  height: 50px;
  transition: opacity 180ms ease-in-out, visibility 180ms ease-in-out, transform 180ms ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  background: #fff;
  border: 1px solid rgba(44, 44, 44, 0.23);
  border-radius: 5px;
  padding-left: 48px;
  padding-right: 8px;
  font-weight: 800;
  font-size: 11px;
  color: #2c2c2c;
}

.pin-wrap:hover .pin-text {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

/* Стили для кластера */
.cluster {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.__ymap_container) .ymaps3x0--control__background {
  background-color: transparent;
  box-shadow: none;
}

:deep(.__ymap_container) .ymaps3x0--control-button {
  background-color: #f75e32;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  transition: 180ms ease-in-out;
}

:deep(.__ymap_container) .ymaps3x0--control-button:hover {
  transition: 180ms ease-in-out;
  box-shadow: none;
}

:deep(.__ymap_container) .ymaps3x0--zoom-control_vertical {
  gap: 8px;
}

:deep(.__ymap_container) .ymaps3x0--zoom-fullscreen__in {
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='14' viewBox='0 0 16 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.26 13.86V0.135H3.845V1.86L2.42 1.83V12.165L3.845 12.15V13.86H0.26ZM12.0584 13.86V12.15L13.4834 12.165V1.83L12.0584 1.86V0.135H15.6434V13.86H12.0584Z' fill='white'/%3E%3C/svg%3E%0A");
  background-repeat: no-repeat;
  background-position: center;
  display: block;
  height: 24px;
  width: 24px;
}

:deep(.__ymap_container) .ymaps3x0--zoom-control__in {
  background-image: url("data:image/svg+xml,%3Csvg width='15' height='14' viewBox='0 0 15 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.928 13.904V8.552H0.72V5.384H5.928V0.128H9.144V5.384H14.4V8.552H9.144V13.904H5.928Z' fill='white'/%3E%3C/svg%3E%0A");
}
svg{
  transition: 180ms ease-in-out;
}
:deep(.__ymap_container){
  svg{
    transition: 180ms ease-in-out;
  }

}

:deep(.__ymap_container) .ymaps3x0--zoom-control__out {
  background-image: url("data:image/svg+xml,%3Csvg width='7' height='4' viewBox='0 0 7 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.576 3.736V0.568H6.768V3.736H0.576Z' fill='white'/%3E%3C/svg%3E%0A");
}
</style>