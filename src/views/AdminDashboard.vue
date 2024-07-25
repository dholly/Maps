<template>
  <div class="admin-dashboard">
    <h1>Панель управления</h1>
    <nav class="admin-nav">
      <router-link to="/admin/locations">Управление локациями</router-link>
      <router-link to="/admin/routes">Управление маршрутами</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
// Нет необходимости в дополнительной логике
</script>

<style scoped>
.admin-dashboard {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.admin-nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.admin-nav a {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.admin-nav a:hover {
  background-color: #45a049;
}

.admin-nav a.router-link-active {
  background-color: #45a049;
  font-weight: bold;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 10px;
  }

  .admin-nav {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-nav a {
    text-align: center;
  }
}
</style>