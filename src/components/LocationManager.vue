<template>
  <div class="admin-panel">
    <h2>Управление локациями</h2>
    <form @submit.prevent="editingLocation ? updateLocation() : addLocation()">
      <div class="form-group">
        <label for="title">Название:</label>
        <input id="title" v-model="locationForm.title" placeholder="Введите название локации" required>
      </div>

      <div class="form-group">
        <label for="tag">Тег:</label>
        <input id="tag" v-model="locationForm.tag" placeholder="Введите тег">
      </div>

      <div class="form-group">
        <label for="property">Свойство:</label>
        <input id="property" v-model="locationForm.property" placeholder="Введите свойство">
      </div>

      <div class="form-group">
        <label for="address">Адрес:</label>
        <input id="address" v-model="locationForm.address" placeholder="Введите адрес">
      </div>

      <div class="form-group coordinates">
        <label>Координаты центра:</label>
        <input v-model.number="locationForm.center[0]" type="number" step="any" placeholder="Широта">
        <input v-model.number="locationForm.center[1]" type="number" step="any" placeholder="Долгота">
      </div>

      <div class="form-group">
        <label for="zoom">Зум:</label>
        <input id="zoom" v-model.number="locationForm.zoom" type="number" placeholder="Уровень зума">
      </div>

      <div class="form-group">
        <label for="description">Описание:</label>
        <textarea id="description" v-model="locationForm.description" placeholder="Опишите локацию"></textarea>
      </div>

      <div class="form-group">
        <label for="likes">Лайки:</label>
        <input id="likes" v-model.number="locationForm.likes" type="number" placeholder="Количество лайков">
      </div>

      <div class="form-group checkbox">
        <label for="price">
          <input id="price" v-model="locationForm.price" type="checkbox">
          Платная локация
        </label>
      </div>

      <div class="form-group checkbox">
        <label for="isHistorical">
          <input id="isHistorical" v-model="locationForm.isHistorical" type="checkbox">
          Историческое место
        </label>
      </div>

      <div class="form-group">
        <label for="audioUrl">URL аудио: (пока оставьте пустым)</label>
        <input id="audioUrl" v-model="locationForm.audioUrl" placeholder="https://example.com/audio.mp3">
      </div>

      <div class="form-actions">
        <button type="submit">{{ editingLocation ? 'Обновить локацию' : 'Добавить локацию' }}</button>
        <button type="button" @click="cancelEdit" v-if="editingLocation">Отменить редактирование</button>
      </div>
    </form>

    <ul class="item-list">
      <li v-for="location in locations" :key="location.id">
        {{ location.title }}
        <div class="item-actions">
          <button @click="startEdit(location)">Редактировать</button>
          <button @click="deleteLocation(location.id)">Удалить</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/api';

const locations = ref([]);
const editingLocation = ref(null);

const initialFormState = {
  title: '',
  tag: '',
  property: '',
  address: '',
  center: [0, 0],
  zoom: 10,
  description: '',
  likes: 0,
  price: false,
  isHistorical: false,
  audioUrl: ''
};

const locationForm = reactive({...initialFormState});

const fetchLocations = async () => {
  try {
    const response = await api.getLocations();
    locations.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке локаций:', error);
  }
};

const addLocation = async () => {
  try {
    await api.createLocation(locationForm);
    await fetchLocations();
    resetForm();
  } catch (error) {
    console.error('Ошибка при добавлении локации:', error);
  }
};

const updateLocation = async () => {
  try {
    await api.updateLocation(editingLocation.value.id, locationForm);
    await fetchLocations();
    resetForm();
  } catch (error) {
    console.error('Ошибка при обновлении локации:', error);
  }
};

const deleteLocation = async (id) => {
  try {
    await api.deleteLocation(id);
    await fetchLocations();
  } catch (error) {
    console.error('Ошибка при удалении локации:', error);
  }
};

const startEdit = (location) => {
  editingLocation.value = location;
  Object.assign(locationForm, location);
};

const cancelEdit = () => {
  resetForm();
};

const resetForm = () => {
  editingLocation.value = null;
  Object.assign(locationForm, initialFormState);
};

onMounted(fetchLocations);
</script>


<style scoped>
.hidden{ display: none!important;}
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