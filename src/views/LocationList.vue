<script setup>
// Импорт необходимых модулей
import {computed, ref, onMounted, onBeforeUnmount, watch, shallowRef, inject, nextTick,} from 'vue';
import {Swiper, SwiperSlide} from 'swiper/vue';
import {Mousewheel, FreeMode, Pagination} from 'swiper/modules';
import {
  YandexMap,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultSchemeLayer, YandexMapFeature,
  YandexMapMarker,
  YandexMapZoomControl
} from 'vue-yandex-maps';
import api from '@/services/api';
// import {locations} from "@/data/locations.js";





import LocationOrange from "@/assets/svg/location-orange.vue";
import LikeButton from "@/assets/svg/like-button.vue";
import LocationIcon from "@/assets/svg/location-icon.vue";

const mapCustomization = inject('mapCustomization');
// Импорт стилей Swiper
import 'swiper/scss';
import 'swiper/scss/navigation';
import 'swiper/scss/pagination';
import 'swiper/css/mousewheel';
import 'swiper/css/free-mode';
import {router} from "@/router/index.js";

// Константы
const DEFAULT_CENTER = [84.9480, 56.4884];
const DEFAULT_ZOOM = 12;
const DEFAULT_WIDTH = '100%';
const DEFAULT_HEIGHT = '621px';

// Состояние карты
const map = shallowRef(null);
const isFullscreen = ref(false);
const width = ref(DEFAULT_WIDTH);
const height = ref(DEFAULT_HEIGHT);
const LOCATION = ref({center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM});
const activeLocation = shallowRef(null);

// Состояние фильтров
const activeFilter = ref('status');
const selectedFilterValue = ref({value: '', count: 0, text: ''});
const showFilterOptions = ref(true);

// Состояние отображения локаций
const showingAllLocations = ref(false);
const highlightedLocation = ref(null);
const isLoaded = ref(false);
const locations = ref([]);


// Настройки Swiper
const modules = [Mousewheel, FreeMode, Pagination];
const swiperReady = ref(false);
const swiperInstance = ref(null);
const activeSlideIndex = ref(0);


const selectedLocation = ref(null);


const lineCoordinates = ref([])

const findLocationIndex = (location) => {
  return filteredLocations.value.findIndex(loc =>
      loc.center[0] === location.center[0] && loc.center[1] === location.center[1]
  );
};


// Тексты для опций фильтра
const optionTexts = {
  'Адаптированные сооружения': 'Значимость этих проблем настолько очевидна, что постоянное информационно-пропагандистское обеспечение нашей деятельности позволяет....',
  'Заброшенные сооружения': 'Значимость этих проблем настолько очевидна, что постоянное информационно-пропагандистское обеспечение нашей деятельности позволяет....Значимость этих проблем настолько очевидна, что постоянное информационно-пропагандистское обеспечение нашей деятельности позволяет....',
};

// Вычисляемые свойства для фильтров
const statusFilters = computed(() => [...new Set(locations.value.map(loc => loc.tag))]);
const functionFilters = computed(() => [...new Set(locations.value.map(loc => loc.property))]);

// Фильтрация локаций
const filteredLocations = computed(() => {
  if (!activeFilter.value || !selectedFilterValue.value.value) return locations.value;
  const filterKey = activeFilter.value === 'status' ? 'tag' : 'property';
  return locations.value.filter(location => location[filterKey] === selectedFilterValue.value.value);
});

// Функция для обновления позиции карты при изменении активного слайда
const updateMapPosition = (index) => {
  if (filteredLocations.value[index]) {
    const location = filteredLocations.value[index];
    LOCATION.value = {center: location.center, zoom: 16};
    highlightedLocation.value = location;
  }
};

// Обработчик изменения активного слайда
const onSlideChange = (swiper) => {
  activeSlideIndex.value = swiper.activeIndex;
};

// Наблюдатель за изменением активного слайда
watch(activeSlideIndex, (newIndex) => {
  updateMapPosition(newIndex);
});

// Функция для прокрутки к определенному слайду
const scrollToSlide = (index) => {
  if (swiperInstance.value) {
    setTimeout(() => {
      swiperInstance.value.slideTo(index, 300);
    }, 100);
  }
};

// Загрузка изображений
import.meta.glob('/src/assets/images/*');

// Функция для получения URL изображения
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

// Модифицированная функция для отображения подробностей локации
const showLocationDetails = (location) => {
  router.push({name: 'LocationDetails', params: {id: location.id}});
};


// Обработчик инициализации Swiper
const onSwiper = (swiper) => {
  console.log('Swiper инициализирован');
  swiperInstance.value = swiper;
  swiperReady.value = true;
};

// Обновление счетчика фильтра
const updateFilterCount = (value) => {
  const filterKey = activeFilter.value === 'status' ? 'tag' : 'property';
  const newCount = locations.value.filter(location => location[filterKey] === value).length;
  selectedFilterValue.value = {
    value,
    count: newCount,
    text: optionTexts[value] || ''
  };
};

// Переключение фильтра
const toggleFilter = (filterType) => {
  if (activeFilter.value === filterType) {
    showFilterOptions.value = !showFilterOptions.value;
  } else {
    activeFilter.value = filterType;
    showFilterOptions.value = true;
    const firstOption = activeFilter.value === 'status' ? statusFilters.value[0] : functionFilters.value[0];
    updateFilterCount(firstOption);
  }
  resetMapView();
  showingAllLocations.value = false;
};

// Сброс вида карты
const resetMapView = () => {
  LOCATION.value = {center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM};
  activeLocation.value = null;
  highlightedLocation.value = null;
};

// Функция для склонения слова "объект"
const getDeclinedWord = (count) => {
  count = Math.abs(count) % 100;
  const lastDigit = count % 10;

  if (count > 10 && count < 20) {
    return 'объектов';
  }
  if (lastDigit > 1 && lastDigit < 5) {
    return 'объекта';
  }
  if (lastDigit === 1) {
    return 'объект';
  }
  return 'объектов';
};

// Вычисляемое свойство для склонения слова
const declinedWord = computed(() => getDeclinedWord(selectedFilterValue.value.count));

// Выбор значения фильтра
const selectFilterValue = (value) => {
  updateFilterCount(value);
  showFilterOptions.value = false;
  resetMapView();
  showingAllLocations.value = false;
};

// Выбор локации
const selectLocation = (newLocation) => {
  console.log('Выбрана локация:', newLocation);
  const index = findLocationIndex(newLocation);
  console.log('Найден индекс:', index);
  if (index !== -1) {
    showingAllLocations.value = true;
    LOCATION.value = {center: newLocation.center, zoom: 16};
    activeLocation.value = newLocation;
    highlightedLocation.value = newLocation;

    nextTick(() => {
      if (swiperInstance.value) {
        console.log('Прокручиваем к слайду:', index);
        swiperInstance.value.slideTo(index, 300);
      }
    });
  } else {
    console.log('Локация не найдена в отфильтрованном списке');
  }
};

onMounted(async () => {
  try {
    const response = await api.getLocations();
    locations.value = response.data;
    // After fetching locations, initialize the first filter
    const firstStatusOption = statusFilters.value[0];
    updateFilterCount(firstStatusOption);
    if (filteredLocations.value.length > 0) {
      updateMapPosition(0);
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
  } finally {
    setTimeout(() => {
      isLoaded.value = true;
    }, 100);
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

const waitForSwiperReady = () => {
  console.log('waitForSwiperReady called, current swiperReady value:', swiperReady.value);
  return new Promise((resolve) => {
    if (swiperReady.value && swiperInstance.value) {
      console.log('Swiper already ready');
      resolve();
    } else {
      console.log('Waiting for swiper to be ready...');
      const unwatch = watch([swiperReady, swiperInstance], ([readyValue, instanceValue]) => {
        console.log('swiperReady changed to:', readyValue, 'swiperInstance:', !!instanceValue);
        if (readyValue && instanceValue) {
          unwatch();
          console.log('Swiper is now ready');
          resolve();
        }
      });
    }
  });
};

// Переключение полноэкранного режима
const toggleFullscreen = () => {
  if (!map.value?.container) return;
  isFullscreen.value ? document.exitFullscreen() : map.value.container.requestFullscreen();
};

// Обработчик изменения полноэкранного режима
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

// Показать все локации для текущего фильтра
const showAllForCurrentFilter = () => {
  showingAllLocations.value = !showingAllLocations.value;
  if (showingAllLocations.value) {
    nextTick(() => {
      if (swiperInstance.value) {
        console.log('Обновляем Swiper');
        swiperInstance.value.update();
        swiperInstance.value.slideTo(0, 0); // Прокручиваем к первому слайду
      } else {
        console.log('Экземпляр Swiper недоступен');
      }
    });
  }
};

// Подсветка локации
const highlightLocation = (location) => {
  highlightedLocation.value = location;
  LOCATION.value = {center: location.center, zoom: 16};
};

// Хуки жизненного цикла
onMounted(() => {
  const firstStatusOption = statusFilters.value[0];
  updateFilterCount(firstStatusOption);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  if (filteredLocations.value.length > 0) {
    updateMapPosition(0);
  }
});


onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

// Наблюдатель за изменением полноэкранного режима
watch(isFullscreen, (newValue) => {
  height.value = newValue ? '100vh' : DEFAULT_HEIGHT;
});

watch(showingAllLocations, (newValue) => {
  console.log('showingAllLocations changed to:', newValue);
  if (newValue) {
    nextTick(() => {
      if (swiperInstance.value) {
        console.log('Updating swiper');
        swiperInstance.value.update();
      } else {
        console.log('Swiper instance not available');
      }
    });
  }
});


</script>

<template>
  <div :class="{ 'all-locations': showingAllLocations, 'single-location': selectedLocation }"
       class="app-container">
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
            v-for="location in filteredLocations"
            :key="location.id"
            position="top-center left-center"
            :settings="{ coordinates: location.center }"
        >
          <div class="pin-wrap" @click="selectLocation(location)">
            <location-orange class="pin-icon" :class="{ highlighted: location === highlightedLocation }"/>
            <div class="pin-text">
              <div class="tag">{{ location.title }}</div>
              <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 15L9 8C9 8 4.12419 3.73367 0.999999 1" stroke="#2C2C2C" stroke-width="1.5"
                      stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </yandex-map-marker>
      </yandex-map>
    </div>

    <div class="tab-wrap" :class="{ 'loaded': isLoaded }">
      <div v-if="!selectedLocation" :class=" { 'all-options': showingAllLocations }" class="filter-container">
        <div class="filter-wrap">
          <div v-if="!showingAllLocations" class="filter-buttons">
            <div
                v-for="filterType in ['status', 'function']"
                :key="filterType"
                class="filter-button"
                :class="{ active: activeFilter === filterType }"
                @click="toggleFilter(filterType)"
            >
              {{ filterType === 'status' ? 'По статусу' : 'По функции' }}
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L8 9C8 9 12.2663 4.12419 15 1" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          <div v-if="!showingAllLocations" class="filter-option-wrap">
            <div
                v-for="(option, index) in (activeFilter === 'status' ? statusFilters : functionFilters)"
                :key="option"
                :class="{
                'active_filter': selectedFilterValue.value === option,
                'show': isLoaded
                 }"
                class="filter-option"
                @click="selectFilterValue(option)"
                :style="{ transitionDelay: `${index * 50}ms` }"
            >
              <location-orange
                  :class="{ active_filter: activeFilter === 'status' && selectedFilterValue.value === option }"/>
              <p>{{ option }}</p>
            </div>
          </div>

          <div v-if="!showingAllLocations && selectedFilterValue.value"
               class="option-text-wrap">
            <svg width="100%" height="2" viewBox="0 0 245 2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H244" stroke="#E7E7E7" stroke-linecap="round"/>
            </svg>
            <div class="option-text">
              <div>{{ selectedFilterValue.value }}</div>
              <div>{{ selectedFilterValue.text }}</div>
            </div>

            <div
                class="show-more"
                :class="{ 'active': showingAllLocations }"
                @click="showAllForCurrentFilter"
            >
              <span>{{ selectedFilterValue.count }} {{ declinedWord }}</span>
              <svg width="36" height="8" viewBox="0 0 36 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M35.3536 4.35355C35.5488 4.15829 35.5488 3.84171 35.3536 3.64645L32.1716 0.464467C31.9763 0.269205 31.6597 0.269205 31.4645 0.464467C31.2692 0.65973 31.2692 0.976312 31.4645 1.17157L34.2929 4L31.4645 6.82843C31.2692 7.02369 31.2692 7.34027 31.4645 7.53554C31.6597 7.7308 31.9763 7.7308 32.1716 7.53554L35.3536 4.35355ZM-2.12312e-08 4.5L35 4.5L35 3.5L2.12312e-08 3.5L-2.12312e-08 4.5Z"
                    fill="black" fill-opacity="0.61"/>
              </svg>
            </div>
          </div>
          <div v-if="showingAllLocations && selectedFilterValue.value"
               class="all-locations-text-wrap">
            <div
                class="all-title"
                @click="showAllForCurrentFilter"
            >
              <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1L2 8C2 8 6.87581 12.2663 10 15" stroke="#2C2C2C" stroke-width="1.5"
                      stroke-linecap="round"/>
              </svg>
              <span>{{ selectedFilterValue.value }}</span>
            </div>

            <div class="all-locations-text">
              <div>
                {{ selectedFilterValue.text }}
              </div>
            </div>
            <svg width="100%" height="1" viewBox="0 0 364 1" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="4.37114e-08" y1="0.5" x2="364" y2="0.500032" stroke="black" stroke-opacity="0.12"/>
            </svg>

            <div
                class="all-locations-show-more"
                :class="{ 'active': showingAllLocations }"
                @click="showAllForCurrentFilter"
            >
              <span>{{ selectedFilterValue.count }} {{ declinedWord }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
          v-show="showingAllLocations && !selectedLocation"
          class="all-locations-list"
          :class="{ 'show': showingAllLocations }"
      >
        <swiper
            :slides-per-view="'auto'"
            :loop="false"
            :space-between="20"
            :modules="modules"
            class="mySwiper"
            :direction="'vertical'"
            :pagination="{
              clickable: true,
              type: 'bullets',
              el: '.swiper-pagination',
            }"
            :mousewheel="true"
            :free-mode="false"
            :grab-cursor="true"
            :centered-slides="true"
            :rewind="false"
            :auto-height="true"
            @swiper="onSwiper"
            @slideChange="onSlideChange"
        >
          <swiper-slide
              v-for="(location, index) in filteredLocations"
              :key="location.title"
              class="location-item"
              :class="{ highlighted: index === activeSlideIndex }"
          >
            <div class="location-image">
              <img :src="getImageUrl(location.image)" :alt="location.title">
            </div>
            <div class="location-info">
              <h3>{{ location.address }}</h3>
              <p class="location-address">
                <location-icon/>
                {{ location.title }}
              </p>
              <div class="all-locations-likes-more">
                <div class="location-likes">
                  <like-button/>
                  <span>{{ location.likes }}</span>
                </div>
                <button class="details-button" @click.stop="showLocationDetails(location)">
                  Подробнее
                </button>
              </div>
            </div>
          </swiper-slide>
          <div class="swiper-pagination"></div>
        </swiper>
      </div>

    </div>
  </div>
</template>

<style scoped>
.details-button {
  border: 1px solid #2c2c2c;
  border-radius: 5px;
  width: 116px;
  height: 30px;
  background: #2c2c2c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
}

.mySwiper {
  padding: 12px 16px;
}

.location-item {
  height: auto !important;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  background: #f3f3f4;
  border-radius: 5px;
}


.all-locations-likes-more {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
}

.location-likes {
  border-radius: 5px;
  width: 80px;
  height: 30px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  cursor: pointer;
}

.location-address {
  font-weight: 500;
  font-size: 13px;
  color: #2c2c2c;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
}

.all-locations-text-wrap {
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 16px;
}

.all-locations-list {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
  opacity: 0;
  transform: translateY(20px);
}

.all-locations-list.show {
  opacity: 1;
  transform: translateY(0);
}


.location-item h3 {
  font-weight: 800;
  font-size: 15px;
  color: #2c2c2c;
  margin-top: 8px;
  margin-bottom: 0;
}

.location-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.location-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 15px;
  padding-bottom: 15px;
  padding-right: 15px;
}

.all-locations-show-more {
  font-weight: 700;
  font-size: 13px;
  color: #fff;
  border-radius: 5px;
  width: 362px;
  height: 30px;
  background: #f75e32;
  display: flex;
  align-items: center;
  padding-left: 7px;
  cursor: pointer;
  margin-top: 15px;
}

.all-title {
  display: flex;
  align-items: center;
  gap: 20px;
  font-weight: 800;
  font-size: 15px;
  color: #2c2c2c;
  cursor: pointer;
}

.all-locations-text {
  font-weight: 500;
  font-size: 12px;
  text-align: justify;
  color: rgba(38, 38, 38, 0.84);
  margin-top: 20px;
}

.option-text-wrap {
  transition: 180ms ease-in-out;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-left: 16px;
  padding-right: 16px;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-text > div:first-child {
  font-weight: 800;
  font-size: 13px;
  color: rgba(38, 38, 38, 0.84);
}

.option-text > div:last-child {
  font-weight: 500;
  font-size: 12px;
  text-align: justify;
  color: rgba(38, 38, 38, 0.84);
}

.show-more {
  background: rgba(208, 208, 208, 0.39);
  border-radius: 5px;
  padding-left: 9px;
  padding-right: 9px;
  height: 30px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: 180ms ease-in-out;
  font-weight: 700;
  font-size: 13px;
  color: rgba(38, 38, 38, 0.6);
  margin-top: 15px;
}

.show-more:hover {

  transition: 180ms ease-in-out;
  background: rgba(208, 208, 208, 0.29);
}

.show-more svg {
  margin-left: auto;
}

.filter-container {
  display: flex;
  gap: 10px;
  position: relative;
  height: 100%;
}

.filter-container.all-options {
  height: auto;
}

.filter-buttons {
  display: flex;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px;
}

.filter-button {
  font-weight: 500;
  font-size: 12px;
  color: rgba(38, 38, 38, 0.84);
  padding-left: 10px;
  padding-right: 10px;
  border: 1px solid #000;
  border-radius: 5px;
  width: 114px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.filter-button.active {
  background: #2c2c2c;
  color: white;
  border: 1px solid #000;
  border-radius: 5px;
}

.filter-button.active svg path {
  stroke: white;
}

.filter-button svg path {
  stroke: #494949;
}

.arrow {
  margin-left: 5px;
}

.filter-wrap {
  width: 100%;
  height: 100%;
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

.filter-option-wrap {
  display: flex;
  flex-direction: column;
  margin-top: 15px;

}

.filter-option {
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 700;
  font-size: 13px;
  color: #2c2c2c;
  transition: all 0.3s ease-in-out;
  opacity: 0;
  transform: translateY(10px);
}


.filter-option.show {
  opacity: 1;
  transform: translateY(0);
}


.filter-option p {
  font-weight: 700;
  font-size: 13px;
  text-align: right;
  color: #2c2c2c;
  margin-top: auto;
  margin-bottom: 0;
}

.filter-option svg {
  transition: 180ms ease-in-out;
  opacity: 0.3;
  filter: grayscale(1.0);
}

.filter-option.active_filter svg {
  transition: 180ms ease-in-out;
  opacity: 1;
  filter: grayscale(0);
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


.breadcrumbs > div {
  border: 1px solid #2c2c2c;
  border-radius: 5px;
  height: 40px;
  background: #fff;
  padding-left: 14px;
  padding-right: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  font-size: 15px;
  text-align: center;
  color: #2c2c2c;
  max-width: fit-content;
  cursor: pointer;
}

.app-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  width: 100%;
}

.app-container.single-location {
  grid-template-columns: 1fr;
}

.app-container.single-location .tab-wrap {
  order: -1;
}

.app-container.all-locations {
  grid-template-columns: 1fr 400px;
}

.app-container.all-locations .tab-wrap {
  padding: 0;
  gap: 0;
}

.map-wrap {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.tab-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  background: #fff;
  padding-top: 16px;
  padding-bottom: 16px;
  position: relative;
  z-index: 1;
  max-width: 100%;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}


.tab-wrap.loaded {
  opacity: 1;
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
  padding-left: 58px;
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

.all-locations-list {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.all-locations-list.fade-in {
  opacity: 1;
}

.swiper-vertical > .swiper-pagination-bullets, .swiper-pagination-vertical.swiper-pagination-bullets {
  transform: translate3d(4px, -50%, 0);
}



.filter-button {
  transition: all 0.3s ease-in-out;
}

.filter-button.active {
  transform: scale(1.05);
}

:deep(.swiper-vertical) .swiper-pagination-bullet-active {
  background-color: #626262;
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

:deep(.__ymap_container) .ymaps3x0--zoom-control__out {
  background-image: url("data:image/svg+xml,%3Csvg width='7' height='4' viewBox='0 0 7 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.576 3.736V0.568H6.768V3.736H0.576Z' fill='white'/%3E%3C/svg%3E%0A");
}

:deep(.__ymap_container) .ymaps3x0--map {
  width: 100% !important;
}
</style>