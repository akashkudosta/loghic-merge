// API Configuration
export const COINGECKO_API_KEY = 'CG-gJADvWKpXL2DMiYwNLxb6v5z';
export const COINGECKO_API_URL = 'https://pro-api.coingecko.com/api/v3';

// API Endpoints
export const ENDPOINTS = {
  SIMPLE_PRICE: '/simple/price',
};

// API Headers
export const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-cg-pro-api-key': COINGECKO_API_KEY,
});

// API Request Configuration
export const API_CONFIG = {
  headers: getHeaders(),
  baseURL: COINGECKO_API_URL,
};