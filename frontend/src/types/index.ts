export interface GeoPoint {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export interface Shipment {
  id: string;
  origin: GeoPoint;
  destination: GeoPoint;
  current_location: GeoPoint;
  carrier: string;
  mode: 'air' | 'sea' | 'road' | 'rail';
  status: 'on_time' | 'at_risk' | 'delayed' | 'critical';
  eta: string; // ISO datetime string
  progress_percent: number;
  cargo_type: 'electronics' | 'pharmaceuticals' | 'automotive' | 'perishables' | 'general';
  weight_kg: number;
  value_usd: number;
  delay_hours: number;
  disruption_type?: 'weather' | 'port_congestion' | 'customs' | 'mechanical';
  route_nodes: GeoPoint[];
}

export interface DisruptionAlert {
  id: string;
  shipment_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  detected_at: string;
  predicted_delay_hours: number;
  affected_region: string;
  ai_confidence: number;
}

export interface RouteRecommendation {
  original_route_id: string;
  alternative_route: GeoPoint[];
  time_saving_hours: number;
  cost_delta_usd: number;
  risk_reduction_percent: number;
  recommended_carrier: string;
  reasoning: string;
}

export interface SupplyChainMetrics {
  total_shipments: number;
  on_time: number;
  at_risk: number;
  delayed: number;
  critical: number;
  avg_delay_hours: number;
  disruptions_detected_today: number;
  routes_optimized_today: number;
  cost_saved_usd: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
