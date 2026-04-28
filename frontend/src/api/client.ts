import axios from 'axios';
import { Shipment, SupplyChainMetrics, DisruptionAlert, RouteRecommendation } from '../types';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const chatQuery = async (question: string, context: object): Promise<{ response: string }> => {
  const { data } = await client.post<{ response: string }>('/assistant/chat', { question, context });
  return data;
};

export default client;
