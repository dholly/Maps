<script setup>
// Импорты
import {computed, onBeforeUnmount, onMounted, ref, shallowRef, watch} from 'vue';
import {
  YandexMap,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultSchemeLayer, YandexMapZoomControl
} from 'vue-yandex-maps';
import {locations} from "@/data/locations.js";
import {customization} from '@/data/map-styles.js';

// Реактивные состояния
const selectedOption = ref(locations[0].tag);
const map = shallowRef(null); // Ссылка на экземпляр карты
const isFullscreen = ref(false); // Полноэкранный режим
const timedCounter = ref(1); // Таймер
const currentLocation = ref(null);
// Переменные для ширины и высоты карты
const width = ref('600px');
const height = ref('600px');


// Настройки камеры
const camera = ref({
  duration: 2500, // Длительность анимации камеры
});


const LOCATION = ref({
  center: [84.9480, 56.4884],
  zoom: 12,
});

const setLocation = (newLocation) => {
  LOCATION.value = newLocation;
  currentLocation.value = newLocation;
};






const toggleFullscreen = () => { // Переключение полноэкранного режима
  const container = map.value.container;
  if (isFullscreen.value) {
    document.exitFullscreen();
  } else {
    container.requestFullscreen();
  }
};

// Жизненный цикл
onMounted(() => {
  const handleFullscreenChange = () => isFullscreen.value = !!document.fullscreenElement; // Обработка изменения полноэкранного режима
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  const interval = setInterval(() => {
    timedCounter.value = (timedCounter.value % 99) + 1;
  }, 1000);

  onBeforeUnmount(() => {
    clearInterval(interval); // Очистка таймера
    document.removeEventListener('fullscreenchange', handleFullscreenChange); // Удаление обработчика событий
  });
});
</script>



<template>
  <div class="app-container">

    <div>
      <button
          v-for="location in locations"
          :key="location.tag"
          @click="setLocation(location)"
      >
        Переместиться в {{ location.title }}
      </button>
    </div>


    <div v-if="currentLocation">
      <h3>{{ currentLocation.title }}</h3>
      <p>{{ currentLocation.description }}</p>
    </div>

    <!-- Яндекс Карта -->
    <yandex-map
        v-model="map"
        :settings="{
        location: {
            ...LOCATION,
            duration: 2500,
        },
        camera,
        theme,
        showScaleInCopyrights: true,
        }"
        :height="isFullscreen ? '100vh' : height" :width="width"

    >
      <yandex-map-default-scheme-layer :settings="{ customization }"/>
      <yandex-map-controls :settings="{ position: 'left' }">
        <yandex-map-control-button :settings="{ onClick: toggleFullscreen }">
          <div :class="{ 'exit-fullscreen': isFullscreen }"/>
          <!-- Иконка кнопки полноэкранного режима -->
          <ymaps class="ymaps3x0--zoom-control__in"></ymaps>
        </yandex-map-control-button>
        <yandex-map-zoom-control>
        </yandex-map-zoom-control>
      </yandex-map-controls>
    </yandex-map>


  </div>
</template>


<style scoped>
.app-container {
  /* Стили контейнера */
}

.location-selector {
  /* Стили для селектора местоположений */
  margin-bottom: 1rem;
}

.location-title {
  /* Стили для названия местоположения */
  margin-bottom: 1rem;
}

.yandex-map {
  /* Дополнительные стили для карты */
  width: 100%;
  height: 600px;
}

.controls {
  /* Стили для элементов управления */
  --map-height: 500px;
}

.all-locations {
  /* Стили для списка всех местоположений */
  margin-top: 1rem;
}

.clickable-location {
  /* Стили для кликабельных местоположений */
  cursor: pointer;
  color: blue; /* Стиль для выделения активных ссылок */
  text-decoration: underline;
}

.counter {
  color: #fff;
  pointer-events: all;
}

.button-element {
  color: #196dff;
  font-weight: bold
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
