import { useState, useEffect, useCallback } from 'react';
import { getShipments, getMetrics, getDisruptions } from '../api/client';
import { Shipment, SupplyChainMetrics, DisruptionAlert } from '../types';

export const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [disruptions, setDisruptions] = useState<DisruptionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [shpData, metData, disData] = await Promise.all([
        getShipments(),
        getMetrics(),
        getDisruptions()
      ]);
      setShipments(shpData);
      setMetrics(metData);
      setDisruptions(disData);
      setError(null);
    } catch (err) {
      console.error("Data synchronization error:", err);
      setError("Failed to sync fleet data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { 
    shipments, 
    metrics, 
    disruptions, 
    loading, 
    error, 
    refetch: fetchData 
  };
};
