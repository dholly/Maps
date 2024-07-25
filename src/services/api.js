import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://api.prom-map.ru/api',
    withCredentials: false,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

export default {
    // Существующие методы
    getLocations() {
        return apiClient.get('/locations');
    },
    getLocation(id) {
        return apiClient.get(`/locations/${id}`);
    },
    getRoutes() {
        return apiClient.get('/routes');
    },
    getRoute(id) {
        return apiClient.get(`/routes/${id}`);
    },
    createPayment() {
        return apiClient.post('/create-payment');
    },

    // Новые методы для работы с локациями
    createLocation(locationData) {
        return apiClient.post('/locations', locationData);
    },
    updateLocation(id, locationData) {
        return apiClient.put(`/locations/${id}`, locationData);
    },
    deleteLocation(id) {
        return apiClient.delete(`/locations/${id}`);
    },

    // Новые методы для работы с маршрутами
    createRoute(routeData) {
        return apiClient.post('/routes', routeData);
    },
    updateRoute(id, routeData) {
        return apiClient.put(`/routes/${id}`, routeData);
    },
    deleteRoute(id) {
        return apiClient.delete(`/routes/${id}`);
    }
};