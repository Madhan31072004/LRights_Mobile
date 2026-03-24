import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { enqueueOfflineAction } from '../utils/offlineDB';

// IMPORTANT: Using LAN IP for maximum stability (no expiration)
// Make sure your phone and computer are on the same Wi-Fi!
// Dynamically use PROD or LOCAL API URL
const baseURL = process.env.NODE_ENV === 'production' 
  ? "/api" 
  : (process.env.EXPO_PUBLIC_API_URL || "http://192.168.139.150:5000/api");


const instance = axios.create({
  baseURL,
  timeout: 60000, 
  headers: {
      "Bypass-Tunnel-Reminder": "true"
  }
});

instance.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Request interceptor error:', error);
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Check if network error or timeout
    const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
    const isAuthRoute = config && (config.url || '').includes('/auth/');

    if (isNetworkError) {
        console.warn(`[Axios] Network Error detected for: ${config?.url || 'unknown URL'}`);
        console.warn(`[Axios] BaseURL: ${baseURL}`);
        console.warn(`[Axios] Error Code: ${error.code}`);
        console.warn(`[Axios] Error Message: ${error.message}`);
    }

    if (isNetworkError && !isAuthRoute && config && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
      console.log('[Axios] Queuing action offline:', config.url);
      
      const relativeUrl = config.url.replace(baseURL, '');
      await enqueueOfflineAction({
        method: config.method,
        url: relativeUrl,
        data: config.data ? JSON.parse(config.data) : undefined
      });

      return {
        data: { offline: true, message: 'Action saved offline.' },
        status: 202,
        statusText: 'Queued Offline',
        config,
        headers: {},
      };
    }

    if (error.response) {
        const isSilent = [429, 404].includes(error.response.status);
        if (isSilent) {
            console.log(`[Axios] API Error ${error.response.status} (Silent):`, error.response.data);
        } else {
            console.error(`[Axios] API Error ${error.response.status}:`, error.response.data);
            if (error.response.status === 503) {
                console.error("[Axios] ERROR 503: Tunnel seems closed. Restart 'npx localtunnel --port 5000' and update baseURL in axios.js.");
            }
        }
    } else {
        console.error(`[Axios] Generic Error:`, error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
