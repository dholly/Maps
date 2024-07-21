<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  YandexMap,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultSchemeLayer,
  YandexMapMarker,
  YandexMapZoomControl
} from 'vue-yandex-maps';
import LocationOrange from "@/assets/svg/location-orange.vue";
import { customization } from "@/data/map-styles";
import { locations } from "@/data/locations";
import { routes } from "@/data/routes";

const route = useRoute();
const router = useRouter();

// Константы
const DEFAULT_CENTER = [84.9480, 56.4884];
const DEFAULT_ZOOM = 12;
const DEFAULT_WIDTH = '100%';
const DEFAULT_HEIGHT = '400px';

// Реактивное состояние
const location = ref(null);
const isLoading = ref(true);
const error = ref(null);
const map = ref(null);
const relatedRoutes = ref([]);
const width = ref(DEFAULT_WIDTH);
const height = ref(DEFAULT_HEIGHT);
const isFullscreen = ref(false);
const isExpanded = ref(false);
const isBookmarked = ref(false);
const isLiked = ref(false);

// Вычисляемые свойства
const LOCATION = computed(() => ({
  center: location.value?.center || DEFAULT_CENTER,
  zoom: location.value?.zoom || DEFAULT_ZOOM
}));

const truncatedDescription = computed(() => {
  if (location.value && location.value.description) {
    const words = location.value.description.split(' ');
    if (words.length > 10) {
      return words.slice(0, 10).join(' ') + '...';
    }
    return location.value.description;
  }
  return '';
});

// Методы
const fetchLocationData = async (locationId) => {
  isLoading.value = true;
  error.value = null;
  try {
    const foundLocation = locations.find(loc => loc.id === locationId);
    if (!foundLocation) throw new Error('Локация не найдена');
    location.value = foundLocation;

    relatedRoutes.value = routes.filter(r =>
        r.pointsOfInterest.some(poi => poi.title === foundLocation.title)
    );
  } catch (err) {
    error.value = err.message || 'Произошла неизвестная ошибка';
  } finally {
    isLoading.value = false;
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

const goToRoute = (routeId) => {
  router.push({
    name: 'RouteDetails',
    params: { id: routeId.toString() }
  }).catch(error => {
    console.error('Ошибка при переходе к маршруту:', error);
  });
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    width.value = '100vw';
    height.value = '100vh';
  } else {
    width.value = DEFAULT_WIDTH;
    height.value = DEFAULT_HEIGHT;
  }
};

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value;
};

const toggleLike = () => {
  isLiked.value = !isLiked.value;
};

const scrollToMap = () => {
  const mapElement = document.querySelector('.map-container');
  if (mapElement) {
    mapElement.scrollIntoView({ behavior: 'smooth' });
  }
};

// Хуки жизненного цикла
onMounted(async () => {
  const locationId = parseInt(route.params.id, 10);
  await fetchLocationData(locationId);
});
</script>

<template>
  <div class="location-details">
    <div v-if="isLoading" class="loading">
      Загрузка...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="location" class="location-card">
      <div class="location-image">
        <img :src="getImageUrl(location.image)" :alt="location.title" loading="lazy">
      </div>

      <div class="location-info">
        <h1>{{ location.title }}</h1>

        <div v-if="location.isHistorical" class="location-tags">
          <span class="tag highlight">Объект культурного наследия</span>
        </div>

        <div class="location-address">
          <span>{{ location.address }}</span>
        </div>

        <div class="action-buttons">
          <button @click="scrollToMap" class="map-button">Показать на карте</button>
          <button
              v-for="route in relatedRoutes"
              :key="route.id"
              class="route-button"
              @click="goToRoute(route.id)"
          >
            Маршрут "{{ route.name }}"
          </button>
        </div>

        <h2>О месте</h2>
        <div class="location-description">
          <p>
            {{ isExpanded ? location.description : truncatedDescription }}
            <button v-if="!isExpanded && location.description.split(' ').length > 10"
                    @click="isExpanded = true"
                    class="read-more">
              читать далее
            </button>
          </p>
        </div>

        <div v-if="location.audioUrl" class="audio-player">
          <audio controls>
            <source :src="`https://${location.audioUrl}`" type="audio/mpeg">
            Ваш браузер не поддерживает аудио элемент.
          </audio>
        </div>

        <div class="location-features">
          <span class="feature">{{ location.tag }}</span>
          <span class="feature">{{ location.property }}</span>
        </div>
      </div>

      <div class="location-actions">
        <div class="likes" :class="{ 'liked': isLiked }" @click="toggleLike" aria-label="Количество лайков">
          <span>{{ location.likes }}</span>
        </div>
        <button class="bookmark-button" :class="{ 'bookmarked': isBookmarked }" @click="toggleBookmark" aria-label="Добавить в закладки">
          <!-- Добавить иконку закладки здесь -->
        </button>
      </div>
    </div>

    <div v-if="location" class="map-container">
      <yandex-map
          v-model="map"
          :settings="{ location: LOCATION, showScaleInCopyrights: true }"
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

        <yandex-map-marker
            :key="location.id"
            position="top-center left-center"
            :settings="{ coordinates: LOCATION.center }"
        >
          <div class="pin-wrap">
            <location-orange />
            <div class="pin-text">
              <div class="tag">{{ location.title }}</div>
              <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 15L9 8C9 8 4.12419 3.73367 0.999999 1" stroke="#2C2C2C" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
          </div>
        </yandex-map-marker>
      </yandex-map>
      <button class="open-yandex-maps">Открыть в Яндекс Картах</button>
    </div>

    <div class="comments-section">
      <h3>Комментарии</h3>
      <!-- Компонент комментариев -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.location-details {
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px;
}

.location-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.location-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.location-info {
  padding: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.location-tags {
  margin-bottom: 10px;
}

.tag {
  display: inline-block;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
}

.tag.highlight {
  background-color: #ff5722;
  color: white;
}

.location-address {
  margin-bottom: 15px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.route-button {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.location-description {
  margin-bottom: 20px;

  p {
    margin: 0;
  }
}

.read-more {
  background: none;
  border: none;
  color: #ff5722;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
}

.audio-player {
  margin-bottom: 20px;
}

.location-features {
  display: flex;
  gap: 10px;
}

.feature {
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
}

.location-actions {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid #e0e0e0;
}

.map-container {
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.open-yandex-maps {
  width: 100%;
  padding: 10px;
  background-color: #fff;
  border: none;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;
}

.comments-section {
  margin-top: 20px;
}

.pin-wrap {
  display: flex;
  align-items: center;
}

.pin-text {
  background: white;
  padding: 5px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .route-button {
    width: 100%;
  }
}
</style>