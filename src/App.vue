<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  YandexMap, YandexMapControlButton, YandexMapControls,
  YandexMapDefaultFeaturesLayer, YandexMapDefaultSchemeLayer,
  YandexMapMarker, YandexMapZoomControl
} from 'vue-yandex-maps';
import { locations } from "@/data/locations.js";
import { customization } from '@/data/map-styles.js';
import LocationOrange from "@/assets/svg/location-orange.vue";

// Константы
const DEFAULT_CENTER = [84.9480, 56.4884];
const DEFAULT_ZOOM = 12;
const DEFAULT_WIDTH = '881px';
const DEFAULT_HEIGHT = '621px';

// Состояние карты
const map = ref(null);
const isFullscreen = ref(false);
const width = ref(DEFAULT_WIDTH);
const height = ref(DEFAULT_HEIGHT);
const LOCATION = ref({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
const activeLocation = ref(null);

// Состояние фильтров
const activeFilter = ref('status');
const selectedFilterValue = ref({ value: '', count: 0 });
const showFilterOptions = ref(true);

// Вычисляемые свойства для фильтров
const statusFilters = computed(() => [...new Set(locations.map(loc => loc.tag))]);
const functionFilters = computed(() => [...new Set(locations.map(loc => loc.property))]);

// Фильтрация локаций
const filteredLocations = computed(() => {
  if (!activeFilter.value || !selectedFilterValue.value.value) return locations;
  const filterKey = activeFilter.value === 'status' ? 'tag' : 'property';
  return locations.filter(location => location[filterKey] === selectedFilterValue.value.value);
});

// Обновление количества для выбранного фильтра
function updateFilterCount(value) {
  const filterKey = activeFilter.value === 'status' ? 'tag' : 'property';
  const newCount = locations.filter(location => location[filterKey] === value).length;
  selectedFilterValue.value = { value, count: newCount };
}

// Переключение типа фильтра
function toggleFilter(filterType) {
  if (activeFilter.value === filterType) {
    showFilterOptions.value = !showFilterOptions.value;
  } else {
    activeFilter.value = filterType;
    showFilterOptions.value = true;
    const firstOption = activeFilter.value === 'status' ? statusFilters.value[0] : functionFilters.value[0];
    updateFilterCount(firstOption);
  }
  resetMapView();
}

// Сброс вида карты
function resetMapView() {
  LOCATION.value = { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
  activeLocation.value = null;
}

// Выбор значения фильтра
function selectFilterValue(value) {
  updateFilterCount(value);
  showFilterOptions.value = false;
  resetMapView();
}

// Выбор локации
function selectLocation(newLocation) {
  LOCATION.value = { center: newLocation.center, zoom: DEFAULT_ZOOM };
  activeLocation.value = newLocation;
}

// Переключение полноэкранного режима
function toggleFullscreen() {
  if (!map.value) return;
  const container = map.value.container;
  if (isFullscreen.value) {
    document.exitFullscreen();
  } else {
    container.requestFullscreen();
  }
}

// Обработчик изменения полноэкранного режима
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

// Инициализация компонента
onMounted(() => {
  const firstStatusOption = statusFilters.value[0];
  updateFilterCount(firstStatusOption);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

// Очистка при удалении компонента
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

// Наблюдение за изменением полноэкранного режима
watch(isFullscreen, (newValue) => {
  height.value = newValue ? '100vh' : DEFAULT_HEIGHT;
});
</script>

<template>
  <div class="app-container">
    <div class="map-wrap">
      <!-- Компонент карты Яндекс -->
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
            <div :class="{ 'exit-fullscreen': isFullscreen }" />
          </yandex-map-control-button>
          <yandex-map-zoom-control />
        </yandex-map-controls>

        <!-- Маркеры на карте -->
        <yandex-map-marker
            v-for="location in filteredLocations"
            :key="location.tag"
            position="top-center left-center"
            :settings="{ coordinates: location.center }"
        >
          <div class="pin-wrap" @click="selectLocation(location)">
            <location-orange class="pin-icon" />
            <div class="pin-text">
              <div class="tag">{{ location.title }}</div>
              <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 15L9 8C9 8 4.12419 3.73367 0.999999 1" stroke="#2C2C2C" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
          </div>
        </yandex-map-marker>
      </yandex-map>
    </div>

    <div class="tab-wrap">
      <div class="filter-container">
        <div class="filter-wrap">
          <div class="filter-buttons">
            <!-- Кнопки фильтров -->
            <div
                v-for="filterType in ['status', 'function']"
                :key="filterType"
                class="filter-button"
                :class="{ active: activeFilter === filterType }"
                @click="toggleFilter(filterType)"
            >
              {{ filterType === 'status' ? 'По статусу' : 'По функционалу' }}
              <span class="arrow">▼</span>
            </div>
          </div>

          <!-- Опции фильтра -->
          <div
              v-for="option in (activeFilter === 'status' ? statusFilters : functionFilters)"
              :key="option"
              :class="{ active_filter: selectedFilterValue.value === option }"
              class="filter-option"
              @click="selectFilterValue(option)"
          >
            <location-orange :class="{ active_filter: activeFilter === 'status' && selectedFilterValue.value === option }" />
            <p>{{ option }}</p>
          </div>

          <!-- Отображение выбранного фильтра и количества -->
          <div v-if="selectedFilterValue.value">
            <p>Выбрано: {{ selectedFilterValue.value }}</p>
            <p>Количество: {{ selectedFilterValue.count }}</p>
          </div>
        </div>
      </div>

      <!-- Информация о выбранной локации -->
      <div v-if="activeLocation" class="tab-content">
        <h1>{{ activeLocation.title }}</h1>
        <p>{{ activeLocation.description }}</p>
        <p>Статус: {{ activeLocation.tag }}</p>
        <p>Функционал: {{ activeLocation.property }}</p>
      </div>
    </div>
  </div>
</template>



<style scoped>





.filter-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  position: relative;
}

.filter-buttons {
  display: flex;
}

.filter-button {
  padding: 10px 15px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 120px;
}

.filter-button.active {
  background-color: #333;
  color: white;
}

.arrow {
  margin-left: 5px;
}

.filter-wrap {
  display: flex;
  flex-direction: column;
}

.filter-options {
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.filter-option {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-option p{
  font-weight: 700;
  font-size: 13px;
  text-align: right;
  color: #2c2c2c;
  margin-top: auto;
  margin-bottom: 0;
}

.filter-option svg{
  transition: 180ms ease-in-out;
  opacity: 0.3;
}
.filter-option.active_filter svg{
  transition: 180ms ease-in-out;
  opacity: 1;
}

.filter-option:hover {
  background-color: #f0f0f0;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  background-size: contain;
  background-repeat: no-repeat;
}

.icon.адаптированные {
  background-color: #ff6b35;
}

.icon.действующие,
.icon.заброшенные,
.icon.разрушенные {
  background-color: #ccc;
}

.location-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.location-buttons button {
  padding: 10px 15px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.location-buttons button.active {
  background-color: #007bff;
  color: white;
}


.app-container {
  display: flex;
  gap: 20px;
}

.map-wrap {
  display: flex;
  flex-direction: column;
}

.tab-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}


.property-buttons button {
  padding: 10px 15px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
}

.property-buttons button.active {
  background-color: #007bff;
  color: white;
}

.tag-buttons button {
  padding: 10px 15px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
}


.tag-buttons button.active {
  background-color: #007bff;
  color: white;
}

.location-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.location-buttons button {
  padding: 10px 15px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
}

.location-buttons button.active {
  background-color: #007bff;
  color: white;
}


.tab-content {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-content h1 {
  margin-top: 0;
  color: #343a40;
}

.tab-content p {
  color: #6c757d;
}


.pin-wrap {
  position: relative;
  cursor: pointer;
}

.pin-icon {
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


.pin svg:last-child {
  margin-left: auto;
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

</style>
