from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime

class GeoPoint(BaseModel):
    lat: float
    lng: float
    city: str
    country: str

class Shipment(BaseModel):
    id: str                         # e.g. "SHP-20481"
    origin: GeoPoint
    destination: GeoPoint
    current_location: GeoPoint
    carrier: str                    # e.g. "FedEx", "DHL", "Maersk", "UPS"
    mode: str                       # "air", "sea", "road", "rail"
    status: str                     # "on_time", "at_risk", "delayed", "critical"
    eta: str                        # ISO datetime string
    progress_percent: int           # 0-100
    cargo_type: str                 # "electronics", "pharmaceuticals", "automotive", "perishables", "general"
    weight_kg: float
    value_usd: float
    delay_hours: int                # 0 if on time
    disruption_type: Optional[str] = None  # "weather", "port_congestion", "customs", "mechanical", None
    route_nodes: List[GeoPoint]     # intermediate waypoints

class DisruptionAlert(BaseModel):
    id: str
    shipment_id: str
    severity: str                   # "low", "medium", "high", "critical"
    type: str
    description: str
    detected_at: str
    predicted_delay_hours: int
    affected_region: str
    ai_confidence: float            # 0.0 - 1.0

class RouteRecommendation(BaseModel):
    original_route_id: str
    alternative_route: List[GeoPoint]
    time_saving_hours: int
    cost_delta_usd: float           # negative = savings
    risk_reduction_percent: int
    recommended_carrier: str
    reasoning: str

class SupplyChainMetrics(BaseModel):
    total_shipments: int
    on_time: int
    at_risk: int
    delayed: int
    critical: int
    avg_delay_hours: float
    disruptions_detected_today: int
    routes_optimized_today: int
    cost_saved_usd: float
