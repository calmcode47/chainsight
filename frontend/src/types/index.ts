export interface Shipment {
  id: string;
  origin: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  destination: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  current_location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  } | null;
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
}

export interface DisruptionAlert {
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
}

export interface RouteRecommendation {
  shipment_id: string;
  original_route: any;
  alternative_route: any;
  time_saving_hours: number;
  cost_delta_usd: number;
  risk_reduction_percent: number;
  recommended_carrier: string;
  gemini_reasoning: string;
  created_at?: string;
}

export interface SupplyChainMetrics {
  total_shipments: number;
  on_time: number;
  at_risk: number;
  delayed: number;
  critical: number;
  avg_delay_hours: number;
  disruptions_detected: number;
  routes_optimized: number;
  cost_saved_usd: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
