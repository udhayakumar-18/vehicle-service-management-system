// src/api/vehicleApi.js
import client from './client';

export const getVehicles = () => client.get('/vehicles/');
export const getVehicle = (id) => client.get(`/vehicles/${id}/`);
export const createVehicle = (data) => client.post('/vehicles/', data);
export const updateVehicle = (id, data) => client.put(`/vehicles/${id}/`, data);
export const deleteVehicle = (id) => client.delete(`/vehicles/${id}/`);
