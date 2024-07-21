<script setup>
import {ref, computed, onMounted, onUnmounted, TransitionGroup} from 'vue';
import {locations} from "@/data/locations.js";
import LikeButton from "@/assets/svg/like-button.vue";

// Состояние фильтров
const filters = ref({
  tags: [],
  property: null,
  price: null
});



// Активный выпадающий список
const activeDropdown = ref(null);

// Флаг для отслеживания первоначальной загрузки
const isInitialLoad = ref(true);

// Вычисляем уникальные опции для каждого фильтра
const uniqueOptions = computed(() => ({
  tags: [...new Set(locations.map(l => l.tag))],
  property: [...new Set(locations.map(l => l.property))],
  price: [
    {value: true, label: 'Бесплатно'},
    {value: false, label: 'Платно'}
  ]
}));

// Фильтрация локаций на основе выбранных фильтров
const filteredLocations = computed(() => {
  if (isInitialLoad.value) {
    return locations;
  }
  return locations.filter(location =>
      (filters.value.tags.length === 0 || filters.value.tags.includes(location.tag)) &&
      (!filters.value.property || filters.value.property === location.property) &&
      (filters.value.price === null || filters.value.price === location.price)
  );
});


// Переключение активного выпадающего списка
const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name;
};

// Переключение состояния фильтра
const toggleFilter = (filter, group) => {
  isInitialLoad.value = false;
  if (group === 'tags') {
    const index = filters.value.tags.indexOf(filter);
    if (index === -1) filters.value.tags.push(filter);
    else filters.value.tags.splice(index, 1);
  } else if (group === 'price') {
    filters.value[group] = filters.value[group] === filter ? null : filter;
  } else {
    filters.value[group] = filters.value[group] === filter ? null : filter;
  }
};

// Очистка всех фильтров
const clearFilters = () => {
  filters.value = {tags: [], property: null, price: null};
  isInitialLoad.value = true;
};

// Удаление конкретного фильтра
const removeFilter = (filter, group) => {
  if (group === 'tags') {
    filters.value.tags = filters.value.tags.filter(t => t !== filter);
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

const beforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(30px)';
};

const enter = (el, done) => {
  const delay = el.dataset.index * 50;
  setTimeout(() => {
    el.style.transition = 'all 300ms ease-out';
    el.style.opacity = 1;
    el.style.transform = 'translateY(0)';
  }, delay);
  setTimeout(done, delay + 300);
};

const leave = (el, done) => {
  el.style.transition = 'all 300ms ease-out';
  el.style.opacity = 0;
  el.style.transform = 'translateY(30px)';
  setTimeout(done, 300);
};

// Добавление и удаление обработчика клика при монтировании/размонтировании компонента
onMounted(() => {
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
        <span>{{ name === 'tags' ? 'Статус' : name === 'property' ? 'Функция' : 'Стоимость' }}</span>
        <svg class="dropdown-arrow" :class="{ 'active': activeDropdown === name }" width="16" height="11"
             viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L8 9C8 9 12.2663 4.12419 15 1" stroke="#2C2C2C" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div v-show="activeDropdown === name" class="options">
        <div
            v-for="option in options"
            :key="option.value !== undefined ? option.value : option"
            @click="toggleFilter(option.value !== undefined ? option.value : option, name)"
            class="option"
            :class="{ 'selected': name === 'tags' ? filters[name].includes(option) : filters[name] === (option.value !== undefined ? option.value : option) }"
        >
          {{ option.label || option }}
        </div>
      </div>
    </div>
  </div>

  <!-- Отображение выбранных фильтров -->
  <div class="selected-filters">
    <div v-for="tag in filters.tags" :key="`tag-${tag}`" @click="removeFilter(tag, 'tags')" class="filter-tag">
      <svg class="remove-tag" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.42857 1L16 16M15.5714 1L1 16" stroke="#2C2C2C" stroke-linecap="round"/>
      </svg>
      <span>{{ tag }}</span>
    </div>
    <div v-if="filters.property" :key="`property-${filters.property}`"
         @click="removeFilter(filters.property, 'property')" class="filter-tag">
      <svg class="remove-tag" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.42857 1L16 16M15.5714 1L1 16" stroke="#2C2C2C" stroke-linecap="round"/>
      </svg>
      <span>{{ filters.property }}</span>
    </div>
    <div v-if="filters.price !== null" :key="`price-${filters.price}`" @click="removeFilter(filters.price, 'price')"
         class="filter-tag">
      <svg class="remove-tag" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.42857 1L16 16M15.5714 1L1 16" stroke="#2C2C2C" stroke-linecap="round"/>
      </svg>
      <span>{{ filters.price ? 'Бесплатно' : 'Платно' }}</span>
    </div>
    <button v-if="filters.tags.length || filters.property || filters.price !== null" @click="clearFilters"
            class="clear-filters">Очистить все
    </button>
  </div>

  <!-- Отображение отфильтрованных локаций -->
  <div class="all-locations">
    <div
        class="locations-grid"
    >
      <div
          v-for="location in filteredLocations"
          :key="location.id"
          class="location-card"
      >
        <img :src="getImageUrl(location.image)" :alt="location.title">
        <div class="location-info">
          <h2>{{ location.title }}</h2>
          <div class="locations-likes-button">
          <div class="location-likes"><like-button/> <span>{{ location.likes }}</span></div>
          <router-link :to="{ name: 'LocationDetails', params: { id: location.id } }" class="details-button">
           <span>Подробнее</span>
          </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.location-info{
  padding: 15px;
  h2{
    margin:0;
    font-weight: 800;
    font-size: 16px;
    color: #2c2c2c;
  }
}
.locations-likes-button{
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
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
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  position: absolute;
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

.all-locations {
  background: #fff;
  margin-top: 60px;
  padding: 40px;
  min-height: 400px;
}

.locations-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  row-gap: 47px;
}

.location-card {
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  background: #f3f3f4;
  overflow: hidden;
  transition: 180ms ease-in-out;
  max-width: 364px;
  height: 100%;
  border-radius: 5px;
  img{
    width: 100%;
    height: 310px;
    object-fit: cover;
    transition: 180ms ease-in-out;
    scale: 1;
  }
  &:hover{
    box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.25);
    transition: 180ms ease-in-out;
    img{
      transition: 180ms ease-in-out;
     /* scale: 1.02;*/
    }
  }
}

.location-list-enter-active,
.location-list-leave-active {
  transition: all 0.3s ease;
}

.location-list-enter-from,
.location-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.location-list-move {
  transition: transform 0.3s ease;
}


</style>