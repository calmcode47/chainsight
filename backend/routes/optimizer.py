from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import RouteRecommendation, Shipment
from services.mock_data import mock_service
from services.gemini_service import gemini_service

router = APIRouter()

@router.post("/{shipment_id}", response_model=dict)
async def optimize_single_route(shipment_id: str):
    """Given a shipment ID, calls GeminiService to recommend an optimized route."""
    shipments = mock_service.generate_shipments(count=100)
    shipment = next((s for s in shipments if s.id == shipment_id), None)
    
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment {shipment_id} not found")
    
    # Analyze with Gemini
    recommendation = await gemini_service.optimize_route(shipment.model_dump())
    return recommendation

@router.get("/batch", response_model=List[dict])
async def batch_optimize_at_risk_shipments():
    """Runs AI optimization on all delayed or critical shipments."""
    shipments = mock_service.generate_shipments(count=50)
    at_risk = [s for s in shipments if s.status in ["delayed", "critical"]]
    
    results = []
    for s in at_risk[:5]: # Limit to top 5 for demo performance
        rec = await gemini_service.optimize_route(s.model_dump())
        results.append({
            "shipment_id": s.id,
            "recommendation": rec
        })
        
    return results
