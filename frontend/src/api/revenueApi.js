// src/api/revenueApi.js
import client from './client';

export const getRevenueSummary = () => client.get('/revenue/summary/');
export const getDailyRevenue = (days = 30) => client.get(`/revenue/daily/?days=${days}`);
export const getMonthlyRevenue = (months = 12) => client.get(`/revenue/monthly/?months=${months}`);
export const getYearlyRevenue = () => client.get('/revenue/yearly/');
