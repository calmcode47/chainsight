import axios from 'axios';
import { Shipment, SupplyChainMetrics, DisruptionAlert, RouteRecommendation } from '../types';
import { supabase } from '../lib/supabase';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple toast helper
const showToast = (message: string, type: 'error' | 'warning' | 'info' = 'info') => {
  if (import.meta.env.DEV) {
    console.warn(`[Toast ${type.toUpperCase()}]: ${message}`);
  }
  if (type === 'error') {
    console.error(`🚨 [Critical Error]: ${message}`);
  }
};

// Request Interceptor: Inject Supabase JWT Token
client.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    } else {
      // 0. Check for Guest Mode fallback token
      const guestAccess = localStorage.getItem('chainsight_guest_access');
      if (guestAccess === 'true') {
        config.headers.Authorization = `Bearer chainsight-guest-demo`;
      } else if (import.meta.env.DEV) {
        console.warn(`⚠️ [API Request]: No session token found for ${config.url}`);
      }
    }
    
    if (import.meta.env.DEV) {
      console.log(`🚀 [API Request]: ${config.method?.toUpperCase()} ${config.url}`);
    }
  } catch (error) {
    console.error('Auth token injection failed:', error);
  }
  return config;
});

// Response Interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      showToast('Cannot reach server. Check your connection.', 'error');
    } else {
      const status = error.response.status;
      if (status === 401) {
        // Only redirect if we are not already on the login page
        if (!window.location.pathname.includes('/login')) {
          showToast('Session expired. Please log in again.', 'warning');
          // In a real app, we might redirect to /login here or trigger a refresh token flow
        }
      } else if (status === 403) {
        showToast('Access denied.', 'error');
      } else if (status === 503) {
        showToast('Backend temporarily unavailable.', 'error');
      } else if (status >= 500) {
        showToast('Internal server error.', 'error');
      }
    }
    return Promise.reject(error);
  }
);

export const getShipments = async (): Promise<Shipment[]> => {
  const { data } = await client.get<Shipment[]>('/shipments');
  return data;
};

export const getMetrics = async (): Promise<SupplyChainMetrics> => {
  const { data } = await client.get<SupplyChainMetrics>('/metrics');
  return data;
};

export const getDisruptions = async (): Promise<DisruptionAlert[]> => {
  const { data } = await client.get<DisruptionAlert[]>('/disruptions');
  return data;
};

export const analyzeDisruptions = async (): Promise<any> => {
  const { data } = await client.post('/disruptions/analyze');
  return data;
};

export const optimizeRoute = async (shipmentId: string): Promise<RouteRecommendation> => {
  const { data } = await client.post<RouteRecommendation>(`/optimizer/${shipmentId}`);
  return data;
};

export const getBatchOptimizations = async (): Promise<any[]> => {
  const { data } = await client.get<any[]>('/optimizer/batch');
  return data;
};

export const chatQuery = async (question: string, context: object): Promise<{ response: string }> => {
  const { data } = await client.post<{ response: string }>('/assistant/chat', { question, context });
  return data;
};

export const acceptOptimization = async (shipmentId: string, optimizationId: string): Promise<any> => {
  const { data } = await client.post(`/optimizer/${shipmentId}/accept`, {
    optimization_id: optimizationId
  });
  return data;
};

export default client;
