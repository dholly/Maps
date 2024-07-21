<script setup>
import { ref, computed, shallowRef } from 'vue';
import {
  YandexMap,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultSchemeLayer,
  YandexMapFeature,
  YandexMapListener,
  YandexMapMarker,
  YandexMapZoomControl
} from 'vue-yandex-maps';
import { customization } from "@/data/map-styles.js";

const DEFAULT_CENTER = [84.9843, 56.5060];
const DEFAULT_ZOOM = 12;
const DEFAULT_WIDTH = '100%';
const DEFAULT_HEIGHT = '621px';

const map = shallowRef(null);
const isFullscreen = ref(false);
const width = ref(DEFAULT_WIDTH);
const height = ref(DEFAULT_HEIGHT);
const LOCATION = ref({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });

const presetCoordinates = [
  [85.035172, 56.517832],
  [84.963648, 56.495693],
  [84.956102, 56.494356],
];

const currentRoute = ref({
  id: 1,
  name: 'Current Route',
  coordinates: [...presetCoordinates],
  color: '#FF5733'
});

const addPoint = (coordinates) => {
  currentRoute.value.coordinates.push(coordinates);
};

const clearAllPoints = () => {
  currentRoute.value.coordinates = [];
};

const copyRouteCoordinates = () => {
  const coordinatesString = JSON.stringify(currentRoute.value.coordinates);
  navigator.clipboard.writeText(coordinatesString).then(() => {
    alert('Координаты скопированы в буфер обмена (ctrl + v)');
  });
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  // Implement fullscreen logic here
};

</script>

<template>
  <div class="map-wrap">
    <yandex-map
        v-model="map"
        :settings="{
        location: {
          ...LOCATION,
          duration: 2500,
        },
        showScaleInCopyrights: true,
      }"
        :height="height"
        :width="width"
    >
      <yandex-map-default-scheme-layer :settings="{ customization }" />
      <yandex-map-default-features-layer />
      <yandex-map-controls :settings="{ position: 'left' }">
        <yandex-map-control-button :settings="{ onClick: toggleFullscreen }">
          <div :class="{ 'exit-fullscreen': isFullscreen }">
            <ymaps class="ymaps3x0--zoom-fullscreen__in"></ymaps>
          </div>
        </yandex-map-control-button>
        <yandex-map-zoom-control />
      </yandex-map-controls>

      <yandex-map-feature
          v-if="currentRoute.coordinates.length > 1"
          :settings="{
          geometry: {
            type: 'LineString',
            coordinates: currentRoute.coordinates,
          },
          style: {
            stroke: [{ color: currentRoute.color, width: 4 }],
          },
        }"
      />

      <yandex-map-listener :settings="{ onClick: (_, e) => addPoint(e.coordinates) }" />

      <yandex-map-controls :settings="{ position: 'right top', orientation: 'vertical' }">
        <yandex-map-marker
            v-for="(coordinate, index) in currentRoute.coordinates"
            :key="`route-marker-${index}`"
            :settings="{ coordinates: coordinate }"
        >
          <div class="route-marker">
            {{ index + 1 }}
          </div>
        </yandex-map-marker>

        <yandex-map-control-button
            v-if="currentRoute.coordinates.length > 0"
            :settings="{ background: '#fd6466e6', color: '#fff', onClick: clearAllPoints }"
        >
         Удалить все точки ({{ currentRoute.coordinates.length }})
        </yandex-map-control-button>

        <yandex-map-control-button
            v-if="currentRoute.coordinates.length > 0"
            :settings="{ background: '#4CAF50', color: '#fff', onClick: copyRouteCoordinates }"
        >
          Скопировать координаты
        </yandex-map-control-button>
      </yandex-map-controls>
    </yandex-map>
  </div>
</template>

<style scoped>
.route-marker {
  background-color: white;
  border: 2px solid black;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}
</style>