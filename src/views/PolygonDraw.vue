<script setup>
import {
  YandexMap,
  YandexMapControl,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultSchemeLayer,
  YandexMapFeature,
  YandexMapListener,
  YandexMapMarker
} from 'vue-yandex-maps';
import {ref, shallowRef, computed, onMounted, onUnmounted, inject} from 'vue';
import LocationOrange from "@/assets/svg/location-orange.vue";

const props = defineProps({
  height: {
    type: String,
    default: '600px'
  },
  width: {
    type: String,
    default: '100%'
  },
  theme: {
    type: String,
    default: 'light'
  }
});

const map = shallowRef(null);
const objects = ref([]);
const currentObject = ref(null);
const isDrawing = ref(false);
const isAddingMarker = ref(false);
const cursorPosition = ref(null);
const clickedPosition = ref(null);
const mapCustomization = inject('mapCustomization');
const TOMSK_COORDINATES = [84.9744, 56.4977];

const mapSettings = computed(() => ({
  location: {
    center: TOMSK_COORDINATES,
    zoom: 11,
  },
  theme: props.theme,
  showScaleInCopyrights: true,
}));

const addPoint = (_, e) => {
  if (isDrawing.value) {
    currentObject.value.polygon.push(e.coordinates);
  } else if (isAddingMarker.value) {
    currentObject.value.marker = {
      coordinates: e.coordinates,
      iconSrc: 'https://yastatic.net/s3/front-maps-static/maps-front-jsapi-3/examples/images/marker-custom-icon/green-capybara.png'
    };
    isAddingMarker.value = false;
    objects.value.push(currentObject.value);
    currentObject.value = null;
  } else {
    clickedPosition.value = e.coordinates;
  }
};

const startDrawing = () => {
  isDrawing.value = true;
  currentObject.value = { polygon: [], marker: null };
};

const stopDrawing = () => {
  if (currentObject.value.polygon.length > 2) {
    // Close the polygon
    currentObject.value.polygon.push(currentObject.value.polygon[0]);
    isDrawing.value = false;
    isAddingMarker.value = true;
  } else {
    alert("Необходимо добавить как минимум 3 точки для создания полигона");
  }
};

const clearAll = () => {
  objects.value = [];
  currentObject.value = null;
  isDrawing.value = false;
  isAddingMarker.value = false;
  clickedPosition.value = null;
};

const calculateArea = (polygon) => {
  if (polygon.length < 4) return 0; // Closed polygon has at least 4 points (first = last)

  let area = 0;
  for (let i = 0; i < polygon.length - 1; i++) {
    let p1 = polygon[i];
    let p2 = polygon[i + 1];
    area += (p2[0] - p1[0]) * (p2[1] + p1[1]);
  }
  area = Math.abs(area / 2);

  // Convert to square kilometers (rough approximation)
  return (area * 111 * 111).toFixed(2);
};

const handleResize = () => {
  if (map.value) {
    map.value.container.fitToViewport();
  }
};

const formatCoordinates = (coords) => {
  if (!coords) return '';
  if (Array.isArray(coords[0])) {
    return coords.map(point => `[${point[0].toFixed(6)}, ${point[1].toFixed(6)}]`).join(', ');
  } else {
    return `[${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]`;
  }
};

const updateCursorPosition = (e) => {
  cursorPosition.value = e.coordinates;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="map-container" :style="{ height, width }">
    <YandexMap
        v-model="map"
        class="map"
        :settings="mapSettings"
    >
      <yandex-map-default-scheme-layer :settings="{ customization: mapCustomization }" />
      <YandexMapDefaultFeaturesLayer/>
      <template v-for="(object, index) in objects" :key="index">
        <YandexMapFeature
            v-if="object.polygon.length > 3"
            :settings="{
            geometry: {
              type: 'Polygon',
              coordinates: [object.polygon],
            },
            style: {
              stroke: [{ color: '#007afce6', width: 4 }],
              fill: 'rgba(0, 122, 252, 0.2)',
            },
          }"
        />
        <YandexMapMarker
            v-if="object.marker"
            position="top-center left-center"
            :settings="{ coordinates: object.marker.coordinates }"
        >
         <location-orange/>
        </YandexMapMarker>
      </template>
      <YandexMapFeature
          v-if="currentObject && currentObject.polygon.length > 0"
          :settings="{
          geometry: {
            type: 'LineString',
            coordinates: currentObject.polygon,
          },
          style: {
            stroke: [{ color: '#007afce6', width: 4 }],
          },
        }"
      />
      <YandexMapMarker
          v-if="clickedPosition"
          position="top-center left-center"
          :settings="{ coordinates: clickedPosition }"
      >
<!--        <div class="coordinate-marker">
          {{ formatCoordinates(clickedPosition) }}
        </div>-->
      </YandexMapMarker>
      <YandexMapListener :settings="{ onClick: addPoint, onMousemove: updateCursorPosition }"/>
      <YandexMapControls :settings="{ position: 'right top', orientation: 'vertical' }">
        <YandexMapControl>
          <div class="info">
            {{
              isDrawing ? 'Кликайте на карту, чтобы добавить точки' : isAddingMarker ? 'Кликните, чтобы добавить маркер' : 'Выберите действие'
            }}
          </div>
        </YandexMapControl>
        <YandexMapControlButton
            v-if="!currentObject"
            :settings="{ background: '#4CAF50', color: '#fff', onClick: startDrawing }"
        >
          Начать рисование
        </YandexMapControlButton>
        <YandexMapControlButton
            v-if="isDrawing"
            :settings="{ background: '#fd6466e6', color: '#fff', onClick: stopDrawing }"
        >
          Завершить рисование
        </YandexMapControlButton>
        <YandexMapControlButton
            v-if="objects.length > 0 || clickedPosition"
            :settings="{ background: '#ff9800', color: '#fff', onClick: clearAll }"
        >
          Очистить всё
        </YandexMapControlButton>
      </YandexMapControls>
    </YandexMap>
    <div class="info-panel">
      <div class="info-item">
        Курсор:     {{ formatCoordinates(clickedPosition) }}
      </div>
      <div v-for="(object, index) in objects" :key="index" class="info-item">
        <strong>Объект {{ index + 1 }}:</strong>
<!--        <div>Площадь: {{ calculateArea(object.polygon) }} км²</div>-->
        <div>Координаты полигона: {{ formatCoordinates(object.polygon) }}</div>
        <div v-if="object.marker">Координаты маркера: {{ formatCoordinates(object.marker.coordinates) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
  height: 100%;
}

.info {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  max-width: 200px;
}

.info-panel {
  position: absolute;
  left: 20px;
  bottom: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  max-width: 300px;
  max-height: 50%;
  overflow-y: auto;
}

.info-item {
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.coordinates-list {
  font-size: 12px;
}

.scrollable {
  max-height: 100px;
  overflow-y: auto;
  word-wrap: break-word;
}

.pin {
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.coordinate-marker {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .info-panel {
    left: 10px;
    bottom: 10px;
    max-width: calc(100% - 20px);
  }
}
</style>