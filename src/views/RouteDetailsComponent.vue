<script setup>
import {ref, computed, shallowRef, inject, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import api from '@/services/api';
import RoutePoint from '@/components/RoutePoint.vue';
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
} from 'vue-yandex-maps';
import Finish from "@/assets/svg/finish.vue";
import LocationNumbered from "@/assets/svg/location-numbered.vue";
import LikeButton from "@/assets/svg/like-button.vue";
import ReviewIcon from "@/assets/svg/review-icon.vue";
import Clock from "@/assets/svg/clock.vue";
import DoubleArrow from "@/assets/svg/double-arrow.vue";
import Listen from "@/assets/svg/listen.vue";

const route = useRoute();
const router = useRouter();
const map = shallowRef(null);
const isFullscreen = ref(false);
const mapWidth = ref('100%');
const mapHeight = ref('621px');

const mapCustomization = inject('mapCustomization');
const selectedRoute = ref(null);

const currentRoute = ref(null);

const ZOOM_RANGE = {min: 12, max: 20};

const LOCATION = computed(() => ({
  center: currentRoute.value?.coordinates[0] || [84.9843, 56.5060],
  zoom: 14
}));

const isLoading = ref(true);

const fetchRouteData = async (routeId) => {
  try {
    isLoading.value = true;
    const response = await api.getRoute(routeId);
    currentRoute.value = response.data;
    await fetchRouteLocations();
  } catch (error) {
    console.error('Error fetching route:', error);
  } finally {
    isLoading.value = false;
  }
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  // Реализуйте здесь логику полноэкранного режима
};

const routeLocations = ref([]);

const fetchRouteLocations = async () => {
  if (!currentRoute.value) return;
  try {
    const response = await api.getLocations();
    const allLocations = response.data;

    const locations = currentRoute.value.pointsOfInterest.map(point => {
      const matchingLocation = allLocations.find(loc => loc.title === point.title);
      return {
        ...point,
        description: matchingLocation?.description || point.description,
        address: matchingLocation?.address || 'Address not available',
        tag: matchingLocation?.tag || 'No tag',
        property: matchingLocation?.property || 'No property',
        likes: matchingLocation?.likes || 0,
        audioUrl: matchingLocation?.audioUrl,
        image: matchingLocation?.image
      };
    });

    routeLocations.value = locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};

const goBack = () => router.push('/routes/');

const getPointCoordinates = (point) => point.coordinates;

const navigateToLocation = async (locationTitle) => {
  try {
    const response = await api.getLocationByTitle(locationTitle);
    if (response.data) {
      router.push({name: 'LocationDetails', params: {id: response.data.id}});
    } else {
      console.error(`Локация не найдена: ${locationTitle}`);
    }
  } catch (error) {
    console.error(`Ошибка при поиске локации ${locationTitle}:`, error);
  }
};

onMounted(async () => {
  const routeId = Number(route.params.id);
  await fetchRouteData(routeId);
});

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
    <div class="route-container">
      <div class="route-image">
        <img src="@/assets/images/template-route.png" alt="Route Photo">
        <button class="bookmark-button" :class="{ 'bookmarked': isBookmarked }" @click="toggleBookmark"
                aria-label="Добавить в закладки">
          <svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1H1V18L6.77778 9.5L13 18V1Z" fill="#F3F3F4" stroke="#2C2C2C" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="route-card">
        <h2>{{ currentRoute.name }}</h2>
        <div class="route-info">

          <div class="route-actions">
            <div class="likes" :class="{ 'liked': isLiked }" @click="toggleLike" aria-label="Количество лайков">
              <like-button/>
              <span>{{ currentRoute.likes }}</span>
            </div>
            <div class="reviews">
              <review-icon/>
              <span>Отзывы</span>
              <span>12</span>
            </div>
            <div class="route-district">{{ currentRoute.district }}</div>
          </div>

          <p class="description">{{ currentRoute.description }}</p>
          <div class="route-tags">
            <div>
              <clock/>
              <span>{{ currentRoute.duration }}</span></div>
            <div>
              <double-arrow/>
              <span>{{ currentRoute.distance }}</span></div>
            <div>
              <listen/>
              <span>Аудиогид</span></div>
          </div>
        </div>

      </div>

      <div class="route-map">
        <yandex-map
            v-model="map"
            :settings="{ location: LOCATION, showScaleInCopyrights: true, zoomRange: ZOOM_RANGE }"
            :height="mapHeight"
            :width="mapWidth"
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

          <yandex-map-feature
              :settings="{
              geometry: { type: 'LineString', coordinates: currentRoute.coordinates },
              style: { stroke: [{ color: '#F75E32', width: 2 }] },
            }"
          />

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



      <div class="route-steps">
        <div v-if="routeLocations.length === 0 || isLoading" class="loading">Loading route locations...</div>
        <div v-else class="steps-container">
          <RoutePoint
              v-for="(location, index) in routeLocations"
              :key="index"
              :location="location"
              :allLocations="routeLocations"
              :routeCoordinates="currentRoute.coordinates"
              :routeColor="currentRoute.color"
              :index="index"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.steps-container{
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.route-steps{
  margin-top: 25px;
  padding: 25px;
}

.route-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  background-color: white;

  h2 {
    font-weight: 800;
    font-size: 22px;
    color: #2c2c2c;
  }

  .route-image {
    position: relative;

    button {
      position: absolute;
      right: 12px;
      top: 12px;
      z-index: 1;
    }
  }

  .route-card {
    padding: 25px;
  }

  .route-info {
    font-weight: 500;
    font-size: 15px;
    color: #2c2c2c;
  }

  .description {
    margin-top: 25px;
    font-weight: 500;
    font-size: 15px;
    color: #2c2c2c;
  }
}

.route-actions {
  display: flex;
  gap: 20px;
  margin-top: 25px;

  > div {
    max-width: fit-content;
  }
}

.route-district {
  height: 32px;
  margin-left: auto;
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  display: flex;
  background: rgba(230, 231, 232, 0.49);
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
}

.likes, .reviews {
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

  &.liked {
    svg {
      path {
        transition: 180ms ease-in-out;
        fill: #2c2c2c;
      }
    }
  }

  span {
    margin-top: 3px;
  }
}

.route-tags {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 25px;

  > div {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    font-size: 16px;
    color: #2c2c2c;

    span {

    }
  }
}

.bookmark-button {
  border: 1px solid transparent;
  border-radius: 5px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  opacity: 0.8;

  &.bookmarked {
    svg {
      path {
        transition: 180ms ease-in-out;
        fill: #2c2c2c;
      }
    }
  }
}


.location-numbered {
  transform: translate(-42px, -43px);
}

.finish {
  transform: translate(-6.5px, -6.5px);
}

.route-details {
  margin-top: 23px;
}

.back-button button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px 10px;
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

.location-numbered {
  z-index: 1;
  position: relative;
}

.pin-text {
  position: absolute;
  top: -49px;
  left: -49px;
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
  padding-left: 100px;
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

svg {
  transition: 180ms ease-in-out;
}

:deep(.__ymap_container) {
  svg {
    transition: 180ms ease-in-out;
  }

}

:deep(.__ymap_container) .ymaps3x0--zoom-control__out {
  background-image: url("data:image/svg+xml,%3Csvg width='7' height='4' viewBox='0 0 7 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.576 3.736V0.568H6.768V3.736H0.576Z' fill='white'/%3E%3C/svg%3E%0A");
}
</style>