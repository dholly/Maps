<template>
  <div class="admin-panel">
    <h2>Управление маршрутами</h2>
    <form @submit.prevent="editingRoute ? updateRoute() : addRoute()">
      <div class="form-group">
        <label for="name">Название:</label>
        <input id="name" v-model="routeForm.name" placeholder="Введите название маршрута" required>
      </div>

      <div class="form-group">
        <h3>Координаты маршрута:</h3>
        <div class="coordinates-list">
          <div v-for="(coord, index) in routeForm.coordinates" :key="index" class="coordinate-item">
            <input v-model.number="routeForm.coordinates[index][0]" type="number" step="any" placeholder="Широта">
            <input v-model.number="routeForm.coordinates[index][1]" type="number" step="any" placeholder="Долгота">
            <button type="button" @click="removeCoordinate(index)">Удалить</button>
          </div>
        </div>
        <button type="button" @click="addCoordinate">Добавить координату</button>
      </div>

      <div class="form-group">
        <label for="description">Описание:</label>
        <textarea id="description" v-model="routeForm.description" placeholder="Опишите маршрут"></textarea>
      </div>

      <div class="form-group hidden">
        <label for="color">Цвет:</label>
        <input id="color" v-model="routeForm.color" type="color">
      </div>

      <div class="form-group">
        <label for="distance">Расстояние:</label>
        <input id="distance" v-model="routeForm.distance" placeholder="Например: 5.3 км">
      </div>

      <div class="form-group">
        <label for="duration">Продолжительность:</label>
        <input id="duration" v-model="routeForm.duration" placeholder="Например: 2 часа 30 минут">
      </div>

      <div class="form-group">
        <label for="district">Район:</label>
        <input id="district" v-model="routeForm.district" placeholder="Введите район">
      </div>

      <div class="form-group">
        <label for="price">
          <input id="price" v-model="routeForm.price" type="checkbox">
          Платный маршрут
        </label>
      </div>

      <div class="form-group hidden">
        <label for="imageUrl">URL изображения:</label>
        <input id="imageUrl" v-model="routeForm.imageUrl" placeholder="https://example.com/image.jpg">
      </div>

      <div class="form-group">
        <label for="likes">Лайки:</label>
        <input id="likes" v-model.number="routeForm.likes" type="number" placeholder="0">
      </div>

      <div class="form-group">
        <label for="createdAt">Дата создания:</label>
        <input id="createdAt" v-model="routeForm.createdAt" type="date">
      </div>

      <div class="form-group">
        <h3>Точки интереса:</h3>
        <div class="points-of-interest">
          <div v-for="(point, index) in routeForm.pointsOfInterest" :key="index" class="point-of-interest">
            <input v-model="point.title" placeholder="Название точки">
            <input v-model.number="point.coordinates[0]" type="number" step="any" placeholder="Широта">
            <input v-model.number="point.coordinates[1]" type="number" step="any" placeholder="Долгота">
            <button type="button" @click="removePointOfInterest(index)">Удалить</button>
          </div>
        </div>
        <button type="button" @click="addPointOfInterest">Добавить точку интереса</button>
      </div>

      <button type="submit">{{ editingRoute ? 'Обновить маршрут' : 'Добавить маршрут' }}</button>
      <button type="button" @click="cancelEdit" v-if="editingRoute">Отменить редактирование</button>
    </form>

    <ul class="item-list">
      <li v-for="route in routes" :key="route.id">
        {{ route.name }}
        <div>
          <button @click="startEdit(route)">Редактировать</button>
          <button @click="deleteRoute(route.id)">Удалить</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/api';

const routes = ref([]);
const editingRoute = ref(null);

const initialFormState = {
  name: '',
  description: '',
  coordinates: [],
  color: '#000000',
  distance: '',
  duration: '',
  district: '',
  price: false,
  pointsOfInterest: [],
  imageUrl: '',
  likes: 0,
  createdAt: new Date().toISOString().split('T')[0]
};

const routeForm = reactive({...initialFormState});

const fetchRoutes = async () => {
  try {
    const response = await api.getRoutes();
    routes.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке маршрутов:', error);
  }
};

const addRoute = async () => {
  try {
    await api.createRoute(routeForm);
    await fetchRoutes();
    resetForm();
  } catch (error) {
    console.error('Ошибка при добавлении маршрута:', error);
  }
};

const updateRoute = async () => {
  try {
    await api.updateRoute(editingRoute.value.id, routeForm);
    await fetchRoutes();
    resetForm();
  } catch (error) {
    console.error('Ошибка при обновлении маршрута:', error);
  }
};

const deleteRoute = async (id) => {
  try {
    await api.deleteRoute(id);
    await fetchRoutes();
  } catch (error) {
    console.error('Ошибка при удалении маршрута:', error);
  }
};

const startEdit = (route) => {
  editingRoute.value = route;
  Object.assign(routeForm, JSON.parse(JSON.stringify(route))); // Глубокое копирование
};

const cancelEdit = () => {
  resetForm();
};

const resetForm = () => {
  editingRoute.value = null;
  Object.assign(routeForm, initialFormState);
};

const addCoordinate = () => {
  routeForm.coordinates.push([0, 0]);
};

const removeCoordinate = (index) => {
  routeForm.coordinates.splice(index, 1);
};

const addPointOfInterest = () => {
  routeForm.pointsOfInterest.push({ title: '', coordinates: [0, 0] });
};

const removePointOfInterest = (index) => {
  routeForm.pointsOfInterest.splice(index, 1);
};

onMounted(fetchRoutes);
</script>

<style scoped>

.hidden{ display: none!important;}

.coordinates-list,
.points-of-interest {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
}

.coordinate-item,
.point-of-interest {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: center;
}

@media (max-width: 768px) {
  .coordinate-item,
  .point-of-interest {
    grid-template-columns: 1fr 1fr;
  }

  .coordinate-item button,
  .point-of-interest button {
    grid-column: span 2;
  }
}

.admin-panel {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  color: #333;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

form {
  display: grid;
  gap: 15px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.coordinates {
  display: flex;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

label {
  margin-bottom: 5px;
  color: #555;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

input[type="checkbox"] {
  width: auto;
  margin-right: 5px;
}

.checkbox {
  flex-direction: row;
  align-items: center;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

button {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button[type="button"] {
  background-color: #f44336;
}

button[type="button"]:hover {
  background-color: #d32f2f;
}

.item-list {
  list-style-type: none;
  padding: 0;
}

.item-list li {
  background-color: #fff;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .admin-panel {
    padding: 10px;
  }

  form {
    padding: 15px;
  }

  .form-group, .coordinates {
    grid-template-columns: 1fr;
  }

  input, textarea, button {
    font-size: 14px;
  }

  .form-actions {
    flex-direction: column;
  }

  .item-list li {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-actions {
    margin-top: 10px;
    width: 100%;
  }

  .item-actions button {
    flex: 1;
  }
}
</style>