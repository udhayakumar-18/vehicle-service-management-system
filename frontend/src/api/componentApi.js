// src/api/componentApi.js
import client from './client';

export const getComponents = () => client.get('/components/');
export const getComponent = (id) => client.get(`/components/${id}/`);
export const createComponent = (data) => client.post('/components/', data);
export const updateComponent = (id, data) => client.put(`/components/${id}/`, data);
export const deleteComponent = (id) => client.delete(`/components/${id}/`);
