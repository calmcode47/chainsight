import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getMetrics } from '../api/client';
import { SupplyChainMetrics } from '../types';

const useRealtimeMetrics = () => {
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSnapshotAt, setLastSnapshotAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Subscribe to new metrics snapshots
    const channel = supabase
      .channel('metrics-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'metrics_snapshots' },
        (payload) => {
          const newMetrics = payload.new as SupplyChainMetrics;
          setMetrics(newMetrics);
          setLastSnapshotAt(new Date().toISOString());
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { metrics, loading, lastSnapshotAt };
};

export default useRealtimeMetrics;
