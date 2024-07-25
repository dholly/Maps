<script setup>
import {ref, computed, onMounted, inject, watch, onUnmounted} from 'vue';
import {Swiper, SwiperSlide} from 'swiper/vue';
import {useRoute, useRouter} from 'vue-router';
import {
  YandexMap,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultSchemeLayer,
  YandexMapMarker,
  YandexMapZoomControl
} from 'vue-yandex-maps';

// Импорт стилей Swiper
import 'swiper/scss';
import 'swiper/scss/navigation';
import 'swiper/scss/pagination';
import 'swiper/css/mousewheel';
import 'swiper/css/free-mode';
import {Pagination, Navigation} from 'swiper/modules';

const swiperModules = [Pagination, Navigation];
import LocationOrange from "@/assets/svg/location-orange.vue";
import api from '@/services/api';
import LocationIcon from "@/assets/svg/location-icon.vue";
import LikeButton from "@/assets/svg/like-button.vue";

const mapCustomization = inject('mapCustomization');
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

// Audio player logic
const audio = ref(null);
const isPlaying = ref(false);
const duration = ref(0);
const currentTime = ref(0);
const progress = computed(() => (currentTime.value / duration.value) * 100 || 0);
const progressBar = ref(null);

// Состояние предпросмотра при перемотке
const showSeekPreview = ref(false);
const seekPreviewPosition = ref(0);
const seekPreviewTime = ref(0);

// Инициализация аудио
const initAudio = () => {
  if (location.value && location.value.audioUrl) {
    audio.value = new Audio(`https://${location.value.audioUrl}`);
    audio.value.addEventListener('loadedmetadata', () => {
      duration.value = audio.value.duration;
    });
    audio.value.addEventListener('timeupdate', updateProgress);
    audio.value.addEventListener('ended', handleEnded);
  }
};

// Обновление прогресса воспроизведения
const updateProgress = () => {
  if (!audio.value) return;
  currentTime.value = audio.value.currentTime;
};

// Воспроизведение/пауза
const togglePlay = () => {
  if (!audio.value) return;
  if (isPlaying.value) {
    audio.value.pause();
  } else {
    audio.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

// Перемотка
const seek = (event) => {
  if (!audio.value || !progressBar.value) return;
  const rect = progressBar.value.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audio.value.currentTime = percent * duration.value;
};

// Предпросмотр времени при наведении на прогресс-бар
const updateSeekPreview = (event) => {
  if (!progressBar.value || !duration.value) return;
  const rect = progressBar.value.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  seekPreviewPosition.value = percent * 100;
  seekPreviewTime.value = percent * duration.value;
  showSeekPreview.value = true;
};

// Скрытие предпросмотра времени
const hideSeekPreview = () => {
  showSeekPreview.value = false;
};

// Перемотка назад на 10 секунд
const skipBackward = () => {
  if (!audio.value) return;
  audio.value.currentTime = Math.max(audio.value.currentTime - 10, 0);
};

// Перемотка вперед на 10 секунд
const skipForward = () => {
  if (!audio.value) return;
  audio.value.currentTime = Math.min(audio.value.currentTime + 10, duration.value);
};

// Обработка окончания воспроизведения
const handleEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
};

// Форматирование времени
const formatTime = (time) => {
  if (time < 0) {
    time = 0;
  }
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Вычисляемые свойства
const LOCATION = computed(() => ({
  center: location.value?.center || DEFAULT_CENTER,
  zoom: location.value?.zoom || DEFAULT_ZOOM
}));

const webUrl = computed(() => {
  if (location.value && location.value.center) {
    const [longitude, latitude] = location.value.center;
    return `https://yandex.ru/maps/67/tomsk/?ll=${longitude}%2C${latitude}&mode=routes&rtext=~${latitude}%2C${longitude}&rtt=pd&ruri=~&z=18`;
  }
  return '#';
});

const mobileUrl = computed(() => {
  if (location.value && location.value.center) {
    const [longitude, latitude] = location.value.center;
    return `yandexmaps://maps.yandex.ru/?pt=${longitude},${latitude}&z=18&l=map`;
  }
  return '#';
});

const isIOS = computed(() => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

const handleAppRedirect = (fallbackUrl) => {
  let timeout;
  const onVisibilityChange = () => {
    if (!document.hidden) {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.location.href = fallbackUrl;
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);

  timeout = setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }, 2500);

  window.location.href = mobileUrl.value;
};

const handleYandexMapsClick = () => {
  if (isIOS.value) {
    handleAppRedirect('https://apps.apple.com/ru/app/yandex-maps/id313877526');
  } else {
    const isMobile = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      handleAppRedirect(webUrl.value);
    } else {
      window.open(webUrl.value, '_blank');
    }
  }
};


onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleAppRedirect);
});


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
    const response = await api.getLocation(locationId);
    location.value = response.data;

    // Fetch related routes
    const routesResponse = await api.getRoutes();
    relatedRoutes.value = routesResponse.data.filter(r =>
        r.pointsOfInterest.some(poi => poi.title === location.value.title)
    );
  } catch (err) {
    error.value = err.message || 'Произошла неизвестная ошибка';
  } finally {
    isLoading.value = false;
  }
};

const getImageUrl = (imageName) => {
  const defaultImageName = 'template-highres.png';
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
    mapElement.scrollIntoView({behavior: 'smooth'});
  }
};

// Хуки жизненного цикла
onMounted(async () => {
  const locationId = parseInt(route.params.id, 10);
  await fetchLocationData(locationId);
  initAudio();
});

// Очистка при размонтировании компонента
onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value.removeEventListener('loadedmetadata', () => {
    });
    audio.value.removeEventListener('timeupdate', updateProgress);
    audio.value.removeEventListener('ended', handleEnded);
  }
});

// Слежение за изменением маршрута
watch(route, () => {
  if (audio.value && isPlaying.value) {
    audio.value.pause();
    isPlaying.value = false;
  }
});

// Слежение за изменением локации
watch(() => location.value, () => {
  if (audio.value) {
    audio.value.pause();
    isPlaying.value = false;
    currentTime.value = 0;
  }
  initAudio();
}, {deep: true});
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
      <div class="location-card-wrap">

        <div class="location-image">
          <swiper
              :modules="swiperModules"
              :slides-per-view="1"
              :loop="true"
              :pagination="{ clickable: true }"
              :navigation="false"
              :grab-cursor="true"
          >
            <swiper-slide>
              <img :src="getImageUrl(location.image)" :alt="location.title" loading="lazy">
            </swiper-slide>

            <swiper-slide>
              <img :src="getImageUrl(location.image)" :alt="location.title" loading="lazy">
            </swiper-slide>


            <swiper-slide>
              <img :src="getImageUrl(location.image)" :alt="location.title" loading="lazy">
            </swiper-slide>
          </swiper>
        </div>


        <div class="location-content">
          <div class="location-info">
            <h1>{{ location.title }}</h1>

            <div v-if="location.isHistorical" class="location-tags">
              <span class="tag">
                <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M13 0L15.9186 8.98278H25.3637L17.7225 14.5344L20.6412 23.5172L13 17.9656L5.35876 23.5172L8.27744 14.5344L0.63623 8.98278H10.0813L13 0Z"
                    fill="#F75E32"/>
                </svg>
                Объект культурного наследия</span>
            </div>

            <div class="location-address">
              <button @click="scrollToMap" class="map-button">Место на карте</button>
              <span>
                <location-icon/>
                {{ location.address }}</span>
            </div>

            <div class="action-buttons">

              <button
                  v-for="route in relatedRoutes"
                  :key="route.id"
                  class="route-button"
                  @click="goToRoute(route.id)"
              >
                Маршрут “{{ route.name }}”
              </button>
            </div>


            <div class="location-description">
              <h2>О месте</h2>
              <p>
                {{ isExpanded ? location.description : truncatedDescription }}
                <button v-if="!isExpanded && location.description.split(' ').length > 10"
                        @click="isExpanded = true"
                        class="read-more">
                  читать далее
                </button>
              </p>
              <div v-if="location && location.audioUrl" class="audio-player" :class="{ 'is-playing': isPlaying }">
                <div class="controls">

                  <button @click="togglePlay" class="play-button">
                    <svg v-if="!isPlaying" width="40" height="40" viewBox="0 0 40 40" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="19" stroke="#2C2C2C" stroke-width="2"/>
                      <path
                          d="M17 26.7139V12.3728C17 11.4878 18.0649 11.039 18.6983 11.657L26.2463 19.0214C26.6561 19.4212 26.6472 20.0829 26.2267 20.4715L18.6788 27.4483C18.0384 28.0402 17 27.586 17 26.7139Z"
                          stroke="#2C2C2C" stroke-width="2"/>
                    </svg>

                    <svg v-else width="40" height="40" viewBox="0 0 40 40" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="19" stroke="#2C2C2C" stroke-width="2"/>
                      <path
                          d="M17 26.7139V12.3728C17 11.4878 18.0649 11.039 18.6983 11.657L26.2463 19.0214C26.6561 19.4212 26.6472 20.0829 26.2267 20.4715L18.6788 27.4483C18.0384 28.0402 17 27.586 17 26.7139Z"
                          fill="#2C2C2C" stroke="#2C2C2C" stroke-width="2"/>
                    </svg>

                  </button>

                </div>
                <div class="progress-bar" ref="progressBar" @click="seek" @mousemove="updateSeekPreview"
                     @mouseleave="hideSeekPreview">
                  <div class="progress" :style="{ width: `${progress}%` }">
                    <div class="thumb"></div>
                  </div>
                  <div v-if="showSeekPreview" class="seek-preview" :style="{ left: `${seekPreviewPosition}%` }">
                    {{ formatTime(seekPreviewTime) }}
                  </div>
                  <div class="time-display">
                    <span>{{ formatTime(currentTime) }}</span>
                    <span>{{ formatTime(duration) }}</span>
                  </div>
                </div>


              </div>
            </div>


            <div class="location-features">
              <span class="feature">{{ location.tag }}</span>
              <span class="feature">{{ location.property }}</span>
            </div>
          </div>
          <div class="location-actions">
            <div class="likes" :class="{ 'liked': isLiked }" @click="toggleLike" aria-label="Количество лайков">
              <like-button/>
              <span>{{ location.likes }}</span>
            </div>
            <button class="bookmark-button" :class="{ 'bookmarked': isBookmarked }" @click="toggleBookmark"
                    aria-label="Добавить в закладки">
              <svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1H1V18L6.77778 9.5L13 18V1Z" fill="#F3F3F4" stroke="#2C2C2C" stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="location" class="map-container">
      <yandex-map
          v-model="map"
          :settings="{ location: LOCATION, showScaleInCopyrights: true }"
          :height="height"
          :width="width"
      >
        <yandex-map-default-scheme-layer :settings="{ customization: mapCustomization }"/>
        <yandex-map-default-features-layer/>
        <yandex-map-controls :settings="{ position: 'left' }">
          <yandex-map-control-button :settings="{ onClick: toggleFullscreen }">
            <div :class="{ 'exit-fullscreen': isFullscreen }">
              <ymaps class="ymaps3x0--zoom-fullscreen__in"></ymaps>
            </div>
          </yandex-map-control-button>
          <yandex-map-zoom-control/>
        </yandex-map-controls>

        <yandex-map-marker
            :key="location.id"
            position="top-center left-center"
            :settings="{ coordinates: LOCATION.center }"
        >
          <div class="pin-wrap">
            <location-orange/>
            <div class="pin-text">
              <div class="tag">{{ location.address }}</div>
            </div>
          </div>
        </yandex-map-marker>
      </yandex-map>
      <a
          :href="yandexMapsUrl"
          class="open-yandex-maps"
          @click.prevent="handleYandexMapsClick"
      >
        Открыть в Яндекс Картах
      </a>
    </div>

    <div class="comments-section">
      <h3>Комментарии</h3>
      <!-- Компонент комментариев -->
    </div>
  </div>
</template>

<style lang="scss" scoped>


.location-card-wrap {
  display: flex;

  > div {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-between;
  }

  .location-image {
    flex-direction: row;
    max-width: 544px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }

  .location-content {
    padding-top: 20px;
    padding-left: 40px;
    padding-right: 20px;
    position: relative;

    .map-button {
      border-radius: 5px;
      width: 120px;
      height: 30px;
      background-color: #f75e32;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      color: #fff;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: 180ms ease-in-out;
      &:hover {
         background-color: #fff;
         color: #f75e32;
         border: 1px solid #f75e32;
         transition: 180ms ease-in-out;
      }
    }
  }
}

.location-info {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.location-address {
  display: flex;
  gap: 20px;
  align-items: center;

  span {
    display: flex;
    align-items: center;
    gap: 14px;
    font-weight: 500;
    font-size: 13px;
    color: #2c2c2c;
  }
}

.location-card {
  background: #fff;
  border-radius: 5px;
  overflow: hidden;
  padding-bottom: 55px;
}


h1 {
  font-weight: 800;
  font-size: 20px;
  color: #2c2c2c;
  margin: 0;
}

.location-tags {
  margin-bottom: 10px;
}

.tag {
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  display: flex;
  gap: 4px;
  align-items: center;
}


.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  button {
    min-width: fit-content;
  }
}

.route-button {
  background-color: transparent;

  border: 1px solid #2c2c2c;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  padding: 8px;
  transition: 180ms ease-in-out;

  &:hover {
    transition: 180ms ease-in-out;
    background-color: #f3f3f4;
  }
}

h2 {
  font-weight: 800;
  font-size: 20px;
  color: #2c2c2c;
  margin: 0;
}

.location-description {
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  display: flex;
  flex-direction: column;
  gap: 15px;

  p {
    margin: 0;
  }
}

.read-more {
  background: none;
  border: none;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
}

.audio-player {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 14px;

  &.is-playing {

  }
}

.progress-bar {
  width: 344px;
  height: 2px;
  background-color: #2c2c2c;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress {
  height: 100%;
  background-color: #2C2C2C;
  border-radius: 3px;
  position: relative;
  transition: width 0.1s linear;
}

.thumb {
  width: 9px;
  height: 9px;
  background-color: #2C2C2C;
  border-radius: 50%;
  position: absolute;
  right: -7px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease;

  &:hover {
    transform: translateY(-50%) scale(1.2);
  }
}

.seek-preview {
  position: absolute;
  top: -25px;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
}

.control-button, .play-button {
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.1s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
}

.play-button {

}

.time-display {
  margin-top: 9px;
  margin-left: -5px;
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  font-size: 11px;
  color: #2c2c2c;
}

.location-features {
  display: flex;
  gap: 10px;

}

.feature {
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  border-radius: 5px;
  padding: 8px;
  display: flex;
  align-items: center;
  background: #f3f3f4;
}

.location-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 15px;

  .likes {
    font-weight: 500;
    font-size: 13px;
    color: #2c2c2c;
    display: flex;
    gap: 6px;
    align-items: center;
    height: 30px;
    padding: 3px;
    padding-right: 5px;
    border: 1px solid #2c2c2c;
    border-radius: 5px;
    cursor: pointer;
    &.liked{
      svg{
        path{
          transition: 180ms ease-in-out;
          fill: #2c2c2c;
        }
      }
    }
    span {
      margin-top: 3px;
    }
  }

  .bookmark-button {
    border: 1px solid #020202;
    border-radius: 5px;
    width: 30px;
    height: 30px;
    background-color: transparent;
    cursor: pointer;
    &.bookmarked{
      svg{
        path{
          transition: 180ms ease-in-out;
          fill: #2c2c2c;
        }
      }
    }
  }
}

.map-container {
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
  position: relative;
   svg{
     position: relative;
     z-index: 1;
   }
}

.pin-icon {
  position: relative;
  z-index: 1;
}

.pin-text {
  position: absolute;
  top: -6px;
  left: -5px;
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
  padding-left: 58px;
  padding-right: 8px;
  font-weight: 800;
  font-size: 11px;
  color: #2c2c2c;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .route-button {
    width: 100%;
  }
}

:deep(.swiper) .swiper-pagination-bullet {
  background-color: white;
  opacity: 0.7;
  transition: 180ms ease-in-out;
}

:deep(.swiper) .swiper-pagination-bullet-active {
  background-color: #2c2c2c;
  opacity: 1;
  transition: 180ms ease-in-out;
}

</style>