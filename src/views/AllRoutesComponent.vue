<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue';
import api from '@/services/api';
import LikeButton from "@/assets/svg/like-button.vue";

// Состояние фильтров
const filters = ref({
  district: [],
  price: null,
  distance: null
});

const routes = ref([]);

// Активный выпадающий список
const activeDropdown = ref(null);

// Флаг для отслеживания первоначальной загрузки
const isInitialLoad = ref(true);

// Вычисляем уникальные опции для каждого фильтра
const uniqueOptions = computed(() => ({
  district: [...new Set(routes.value.map(r => r.district))],
  price: [
    { value: true, label: 'Платно' },
    { value: false, label: 'Бесплатно' }
  ],
  distance: [
    { value: '0-5', label: '0-5 км' },
    { value: '5-10', label: '5-10 км' },
    { value: '10+', label: '10+ км' }
  ]
}));

// Фильтрация маршрутов на основе выбранных фильтров
const filteredRoutes = computed(() => {
  if (isInitialLoad.value) {
    return routes.value;
  }
  return routes.value.filter(route =>
      (filters.value.district.length === 0 || filters.value.district.includes(route.district)) &&
      (filters.value.price === null || filters.value.price === route.price) &&
      (!filters.value.distance || isRouteInDistanceRange(route.distance, filters.value.distance))
  );
});

// Функция для проверки, входит ли маршрут в выбранный диапазон расстояния
const isRouteInDistanceRange = (routeDistance, selectedRange) => {
  const distance = parseFloat(routeDistance);
  switch (selectedRange) {
    case '0-5': return distance <= 5;
    case '5-10': return distance > 5 && distance <= 10;
    case '10+': return distance > 10;
    default: return true;
  }
};

// Переключение активного выпадающего списка
const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name;
};

// Переключение состояния фильтра
const toggleFilter = (filter, group) => {
  isInitialLoad.value = false;
  if (group === 'district') {
    const index = filters.value.district.indexOf(filter);
    if (index === -1) filters.value.district.push(filter);
    else filters.value.district.splice(index, 1);
  } else {
    filters.value[group] = filters.value[group] === filter ? null : filter;
  }
  activeDropdown.value = null;
};

// Очистка всех фильтров
const clearFilters = () => {
  filters.value = { district: [], price: null, distance: null };
  isInitialLoad.value = true;
};

// Удаление конкретного фильтра
const removeFilter = (filter, group) => {
  if (group === 'district') {
    filters.value.district = filters.value.district.filter(d => d !== filter);
  } else {
    filters.value[group] = null;
  }
};

// Обработчик клика вне выпадающего списка
const clickOutside = (e) => {
  if (!e.target.closest('.filter-group')) {
    activeDropdown.value = null;
  }
};

onMounted(async () => {
  try {
    const response = await api.getRoutes();
    routes.value = response.data;
  } catch (error) {
    console.error('Error fetching routes:', error);
  }
  document.addEventListener('click', clickOutside);
  window.scrollTo(0, 0);
});

onUnmounted(() => {
  document.removeEventListener('click', clickOutside);
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
  <div class="filters">
    <div v-for="(options, name) in uniqueOptions" :key="name" class="filter-group">
      <div @click="toggleDropdown(name)" class="select-header">
        <span>{{ name === 'district' ? 'Район' : name === 'price' ? 'Стоимость' : 'Расстояние' }}</span>
        <svg class="dropdown-arrow" :class="{ 'active': activeDropdown === name }" width="16" height="11"
             viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L8 9C8 9 12.2663 4.12419 15 1" stroke="#2C2C2C" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <transition name="dropdown">
        <div v-show="activeDropdown === name" class="options">
          <div
              v-for="option in options"
              :key="option.value !== undefined ? option.value : option"
              @click="toggleFilter(option.value !== undefined ? option.value : option, name)"
              class="option"
              :class="{ 'selected': name === 'district' ? filters[name].includes(option) : filters[name] === (option.value !== undefined ? option.value : option) }"
          >
            {{ option.label || option }}
          </div>
        </div>
      </transition>
    </div>
  </div>

  <!-- Отображение выбранных фильтров -->
  <div class="selected-filters">
    <div v-for="district in filters.district" :key="`district-${district}`" @click="removeFilter(district, 'district')" class="filter-tag">
      <svg class="remove-tag" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.42857 1L16 16M15.5714 1L1 16" stroke="#2C2C2C" stroke-linecap="round"/>
      </svg>
      <span>{{ district }}</span>
    </div>
    <div v-if="filters.price !== null" :key="`price-${filters.price}`"
         @click="removeFilter(filters.price, 'price')" class="filter-tag">
      <svg class="remove-tag" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.42857 1L16 16M15.5714 1L1 16" stroke="#2C2C2C" stroke-linecap="round"/>
      </svg>
      <span>{{ filters.price ? 'Платно' : 'Бесплатно' }}</span>
    </div>
    <div v-if="filters.distance" :key="`distance-${filters.distance}`" @click="removeFilter(filters.distance, 'distance')"
         class="filter-tag">
      <svg class="remove-tag" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.42857 1L16 16M15.5714 1L1 16" stroke="#2C2C2C" stroke-linecap="round"/>
      </svg>
      <span>{{ uniqueOptions.distance.find(o => o.value === filters.distance).label }}</span>
    </div>
    <button v-if="filters.district.length || filters.price || filters.distance" @click="clearFilters"
            class="clear-filters">Очистить все
    </button>
  </div>

  <!-- Отображение отфильтрованных маршрутов -->
  <div class="all-routes">
    <div class="routes-grid">
      <div
          v-for="route in filteredRoutes"
          :key="route.id"
          class="route-card"
      >
        <img :src="getImageUrl(route.imageUrl)" :alt="route.name">
        <div class="route-info">
          <h2>{{ route.name }}</h2>
          <p class="route-description">{{ route.description }}</p>
          <div class="route-details">
            <span>{{ route.distance }}</span>
            <span>{{ route.duration }}</span>
          </div>
<!--          <div class="route-tags">-->
<!--            <span class="tag">{{ route.district }}</span>-->
<!--            <span class="tag">{{ route.price ? 'Платно' : 'Бесплатно' }}</span>-->
<!--          </div>-->
          <div class="routes-likes-button">
            <div class="route-likes"><LikeButton/> <span>{{ route.likes }}</span></div>
            <router-link :to="{ name: 'RouteDetails', params: { id: route.id } }" class="details-button">
              <span>Подробнее</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  max-height: 0;
}

.options {
  transition: all 0.3s ease;
}

.filters {
  display: flex;
  border: 1px solid #2c2c2c;
  border-radius: 5px;
  gap: 30px;
  height: 40px;
  background: #fff;
}

.filter-group {
  position: relative;

  &:first-child {
    padding-left: 14px;
  }
}

.select-header {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  font-weight: 500;
  font-size: 15px;
  color: #2c2c2c;
  cursor: pointer;
}

.dropdown-arrow {
  transition: transform 0.3s ease;

  &.active {
    transform: rotate(180deg);
  }
}

.options {
  position: absolute;
  top: calc(100% + 1px);
  left: -1px;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 0 0 10px 10px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  width: fit-content;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

.option {
  padding: 18px 25px;
  font-weight: 500;
  font-size: 14px;
  color: #2c2c2c;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover, &.selected {
    background-color: rgba(255, 255, 255, 1);
  }
}

.clear-filters {
  background-color: #f0f0f0;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  color: #2c2c2c;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
  }
}

.selected-filters {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 11px;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  font-weight: 500;
  font-size: 14px;
  color: #2c2c2c;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }

  span {
    margin-top: 3px;
  }
}

.remove-tag {
  cursor: pointer;
}

.all-routes {
  background: #fff;
  margin-top: 60px;
  padding: 40px;
  min-height: 400px;
}

.routes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 47px;
}

.route-card {
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  background: #f3f3f4;
  overflow: hidden;
  transition: all 0.3s ease;
  max-width: 364px;
  height: 100%;
  border-radius: 5px;

  img {
    width: 100%;
    height: 310px;
    object-fit: cover;
  }
}

.route-info {
  padding: 15px;

  h2 {
    margin: 0;
    font-weight: 800;
    font-size: 16px;
    color: #2c2c2c;
  }

  .route-description {
    font-size: 14px;
    color: #4a4a4a;
    margin-top: 10px;
  }

  .route-details {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 14px;
    color: #4a4a4a;
  }

  .route-tags {
    display: flex;
    gap: 10px;
    margin-top: 10px;

    .tag {
      background-color: #e0e0e0;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      color: #4a4a4a;
    }
  }
}

.routes-likes-button {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.route-likes {
  display: flex;
  align-items: center;
  gap: 5px;
}
.details-button{
  border-radius: 5px;
  background: #f75e32;
  font-weight: 500;
  font-size: 13px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  width: 116px;
  height: 30px;
  transition: 180ms ease-in-out;
  span{
    transition: 180ms ease-in-out;
    margin-top: 3px;
  }
  &:hover{
    transition: 180ms ease-in-out;
    transform: translateY(-1px);
    span{
      transition: 180ms ease-in-out;

    }
  }
}
</style>
