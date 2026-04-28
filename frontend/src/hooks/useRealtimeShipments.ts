import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getShipments, getDisruptions, getMetrics } from '../api/client';
import { Shipment, DisruptionAlert, SupplyChainMetrics } from '../types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

const useRealtimeShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [disruptions, setDisruptions] = useState<DisruptionAlert[]>([]);
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [sData, dData, mData] = await Promise.all([
        getShipments(),
        getDisruptions(),
        getMetrics()
      ]);
      setShipments(sData);
      setDisruptions(dData);
      setMetrics(mData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch initial supply chain data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    // 1. Subscribe to Shipments changes
    const shipmentChannel = supabase
      .channel('shipments-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        (payload) => {
          setLastUpdated(new Date());
          if (payload.eventType === 'INSERT') {
            setShipments((prev) => [payload.new as Shipment, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setShipments((prev) =>
              prev.map((s) => (s.id === payload.new.id ? { ...s, ...payload.new } : s))
            );
          } else if (payload.eventType === 'DELETE') {
            setShipments((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnectionStatus('connected');
        if (status === 'CLOSED') setConnectionStatus('disconnected');
      });

    // 2. Subscribe to Disruption Alerts changes
    const alertChannel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'disruption_alerts' },
        (payload) => {
          const newAlert = payload.new as DisruptionAlert;
          setDisruptions((prev) => [newAlert, ...prev]);
          setLastUpdated(new Date());
          
          // Trigger notification via global window event or similar if needed
          window.dispatchEvent(new CustomEvent('new-disruption-alert', { detail: newAlert }));
        }
      )
      .subscribe();

    return () => {
      shipmentChannel.unsubscribe();
      alertChannel.unsubscribe();
    };
  }, [fetchInitialData]);

  const retry = () => {
    fetchInitialData();
  };

  return { 
    shipments, 
    disruptions, 
    metrics, 
    loading, 
    error, 
    lastUpdated, 
    connectionStatus, 
    retry 
  };
};

export default useRealtimeShipments;
