// src/api/invoiceApi.js
import client from './client';

export const getInvoices = () => client.get('/invoices/');
export const getInvoiceByService = (serviceId) => client.get(`/invoices/service/${serviceId}/`);
