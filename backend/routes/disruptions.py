from fastapi import APIRouter, HTTPException
from typing import List, dict
from models.schemas import DisruptionAlert
from services.mock_data import mock_service
from services.gemini_service import gemini_service

router = APIRouter()

@router.get("/", response_model=List[DisruptionAlert])
async def get_all_disruptions():
    """Fetch all alerts from MockDataService."""
    shipments = mock_service.generate_shipments(count=50)
    return mock_service.generate_alerts(shipments)

@router.post("/analyze")
async def analyze_shipment_disruptions():
    """Calls GeminiService to analyze current shipments for high-risk disruption patterns."""
    shipments = mock_service.generate_shipments(count=50)
    # Convert Pydantic models to dicts for JSON serialization
    shipment_data = [s.model_dump() for s in shipments]
    
    analysis = await gemini_service.analyze_disruptions(shipment_data)
    return {
        "disruptions": analysis,
        "summary": f"Analyzed {len(shipments)} shipments. Identified {len(analysis)} critical patterns."
    }
