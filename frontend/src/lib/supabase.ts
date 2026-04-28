import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      shipments: {
        Row: {
          id: string;
          origin_city: string;
          origin_country: string;
          origin_lat: number;
          origin_lng: number;
          destination_city: string;
          destination_country: string;
          destination_lat: number;
          destination_lng: number;
          current_city: string | null;
          current_country: string | null;
          current_lat: number | null;
          current_lng: number | null;
          carrier: string;
          mode: 'air' | 'sea' | 'road' | 'rail';
          status: 'on_time' | 'at_risk' | 'delayed' | 'critical';
          eta: string;
          progress_percent: number;
          cargo_type: string | null;
          weight_kg: number | null;
          value_usd: number | null;
          delay_hours: number;
          disruption_type: string | null;
          route_nodes: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shipments']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['shipments']['Row']>;
      };
      disruption_alerts: {
        Row: {
          id: string;
          shipment_id: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          type: string;
          description: string;
          detected_at: string;
          predicted_delay_hours: number | null;
          affected_region: string | null;
          ai_confidence: number;
          resolved: boolean;
          resolved_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['disruption_alerts']['Row'], 'detected_at'>;
        Update: Partial<Database['public']['Tables']['disruption_alerts']['Row']>;
      };
      metrics_snapshots: {
        Row: {
          id: string;
          snapshot_at: string;
          total_shipments: number;
          on_time: number;
          at_risk: number;
          delayed: number;
          critical: number;
          avg_delay_hours: number;
          disruptions_detected: number;
          routes_optimized: number;
          cost_saved_usd: number;
        };
        Insert: Omit<Database['public']['Tables']['metrics_snapshots']['Row'], 'id' | 'snapshot_at'>;
        Update: Partial<Database['public']['Tables']['metrics_snapshots']['Row']>;
      };
    };
  };
}
