<script setup>
import { ref, computed, inject, onMounted, onUnmounted, watch } from 'vue';
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapFeature,
  YandexMapMarker
} from 'vue-yandex-maps';
import LocationNumbered from "@/assets/svg/location-numbered.vue";
import Finish from "@/assets/svg/finish.vue";
import LocationIcon from "@/assets/svg/location-icon.vue";
import LikeButton from "@/assets/svg/like-button.vue";

const props = defineProps({
  location: {
    type: Object,
    required: true
  },
  allLocations: {
    type: Array,
    required: true
  },
  routeCoordinates: {
    type: Array,
    required: true
  },
  routeColor: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

const mapCustomization = inject('mapCustomization');

const LOCATION = computed(() => ({
  center: props.location.coordinates || props.routeCoordinates[0] || [0, 0],
  zoom: 14
}));

// Audio player logic
const audio = ref(null);
const isPlaying = ref(false);
const duration = ref(0);
const currentTime = ref(0);
const progress = computed(() => (currentTime.value / duration.value) * 100 || 0);
const progressBar = ref(null);

const initAudio = () => {
  if (props.location.audioUrl) {
    audio.value = new Audio(`https://${props.location.audioUrl}`);
    audio.value.addEventListener('loadedmetadata', () => {
      duration.value = audio.value.duration;
    });
    audio.value.addEventListener('timeupdate', updateProgress);
    audio.value.addEventListener('ended', handleEnded);
  }
};

const updateProgress = () => {
  if (!audio.value) return;
  currentTime.value = audio.value.currentTime;
};

const togglePlay = () => {
  if (!audio.value) return;
  if (isPlaying.value) {
    audio.value.pause();
  } else {
    audio.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const seek = (event) => {
  if (!audio.value || !progressBar.value) return;
  const rect = progressBar.value.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audio.value.currentTime = percent * duration.value;
};

const handleEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

onMounted(() => {
  initAudio();
});

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value.removeEventListener('loadedmetadata', () => {});
    audio.value.removeEventListener('timeupdate', updateProgress);
    audio.value.removeEventListener('ended', handleEnded);
  }
});

const validLocations = computed(() =>
    props.allLocations.filter(loc => loc && loc.coordinates)
);

// Watch for changes in the location prop
watch(() => props.location, (newLocation) => {
  if (audio.value) {
    audio.value.pause();
    isPlaying.value = false;
    currentTime.value = 0;
  }
  initAudio();
}, { deep: true });
</script>

<template>
  <div class="route-point">
    <div class="media-part">
      <div class="point-info">
        <div class="img-wrap">
          <img :src="getImageUrl(location.image)" :alt="location.title">
        </div>
      </div>
      <div class="point-map">
        <yandex-map v-if="routeCoordinates && routeCoordinates.length > 0"
            :settings="{ location: LOCATION, showScaleInCopyrights: true }"
            :height="'335px'"
            :width="'661px'"
        >
          <yandex-map-default-scheme-layer :settings="{ customization: mapCustomization }"/>
          <yandex-map-default-features-layer/>

          <yandex-map-feature
              :settings="{
        geometry: { type: 'LineString', coordinates: routeCoordinates },
        style: { stroke: [{ color: routeColor, width: 2 }] },
      }"
          />
          <yandex-map-marker
              v-if="routeCoordinates.length > 0"
              :settings="{
        coordinates: routeCoordinates[routeCoordinates.length - 1],
      }"
          >
            <div class="finish">
              <finish/>
            </div>
          </yandex-map-marker>
          <yandex-map-marker
              v-if="routeCoordinates.length > 0"
              :settings="{
        coordinates: routeCoordinates[0],
      }"
          >
            <div class="finish">
              <finish/>
            </div>
          </yandex-map-marker>
          <yandex-map-marker
              v-for="(loc, idx) in allLocations ?? []"
              :key="idx"
              :settings="{ coordinates: loc?.coordinates }"
          >
            <LocationNumbered
                :number="idx + 1"
                :class="{ 'active': idx === index, 'inactive': idx !== index }"
            />
          </yandex-map-marker>
        </yandex-map>
      </div>
    </div>
    <div class="tag-part">
      <h3>{{ index + 1 }}. {{ location.title }}</h3>
      <div v-if="location.address" class="location-address">
        <location-icon />
        <span>{{ location.address }}</span>
      </div>
      <p v-if="location.description">{{ location.description }}</p>
      <div v-if="location.audioUrl" class="audio-player" :class="{ 'is-playing': isPlaying }">
        <div class="controls">
          <button @click="togglePlay" class="play-button">
            <svg v-if="!isPlaying" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="19" stroke="#2C2C2C" stroke-width="2"/>
              <path d="M17 26.7139V12.3728C17 11.4878 18.0649 11.039 18.6983 11.657L26.2463 19.0214C26.6561 19.4212 26.6472 20.0829 26.2267 20.4715L18.6788 27.4483C18.0384 28.0402 17 27.586 17 26.7139Z" stroke="#2C2C2C" stroke-width="2"/>
            </svg>
            <svg v-else width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="19" stroke="#2C2C2C" stroke-width="2"/>
              <path d="M17 26.7139V12.3728C17 11.4878 18.0649 11.039 18.6983 11.657L26.2463 19.0214C26.6561 19.4212 26.6472 20.0829 26.2267 20.4715L18.6788 27.4483C18.0384 28.0402 17 27.586 17 26.7139Z" fill="#2C2C2C" stroke="#2C2C2C" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="progress-bar" ref="progressBar" @click="seek">
          <div class="progress" :style="{ width: `${progress}%` }">
            <div class="thumb"></div>
          </div>
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
      <div v-if="location.tag || location.property" class="location-features">
        <span v-if="location.tag" class="feature">{{ location.tag }}</span>
        <span v-if="location.property" class="feature">{{ location.property }}</span>
      </div>
      <div class="location-actions">
        <div class="likes" :class="{ 'liked': false }" aria-label="Количество лайков">
          <like-button />
          <span>{{ location.likes }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.finish {
  transform: translate(-6.5px, -6.5px);
}
.route-point {
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  background: #f3f3f4;
  border-radius: 5px;
  overflow: hidden;
  .media-part {
    display: flex;

    .point-info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .point-info .img-wrap {
      height: 334px;
      width: 100%;
    }
  }

  .tag-part {
    padding: 25px;
  }
}

.point-info img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h3 {
  font-weight: 800;
  font-size: 20px;
  color: #2c2c2c;
  margin: 0 0 10px 0;
}

.location-address {
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  margin-bottom: 15px;
}

p {
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  margin-bottom: 15px;
}

.audio-player {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 14px;
  margin-bottom: 15px;
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
  margin-bottom: 15px;
}

.feature {
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  border-radius: 5px;
  padding: 8px;
  display: flex;
  align-items: center;
  background: #fff;
}

.location-actions {
  display: flex;
  justify-content: flex-end;
}

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

  span {
    margin-top: 3px;
  }
}

.inactive {
  filter: grayscale(100%);
  opacity: 0.7;
}
</style>