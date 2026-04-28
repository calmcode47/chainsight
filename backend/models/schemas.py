from pydantic import BaseModel, Field
from typing import List, Optional, Union, Any
from datetime import datetime

class GeoPoint(BaseModel):
    lat: float
    lng: float
    city: str
    country: str

class Shipment(BaseModel):
    id: str
    origin: GeoPoint
    destination: GeoPoint
    current_location: Optional[GeoPoint] = None
    carrier: str
    mode: str
    status: str
    eta: str
    progress_percent: int
    cargo_type: Optional[str] = None
    weight_kg: Optional[float] = None
    value_usd: Optional[float] = None
    delay_hours: int
    disruption_type: Optional[str] = None
    route_nodes: List[GeoPoint] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class DisruptionAlert(BaseModel):
    id: str
    shipment_id: str
    severity: str
    type: str
    description: str
    detected_at: str
    predicted_delay_hours: Optional[int] = None
    affected_region: Optional[str] = None
    ai_confidence: float
    resolved: bool = False
    resolved_at: Optional[str] = None

class RouteRecommendation(BaseModel):
    shipment_id: str
    original_route: Any
    alternative_route: Any
    time_saving_hours: int
    cost_delta_usd: float
    risk_reduction_percent: int
    recommended_carrier: str
    gemini_reasoning: str
    created_at: Optional[str] = None

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
