from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Shipment, SupplyChainMetrics
from services.mock_data import mock_service

router = APIRouter()

@router.get("/shipments", response_model=List[Shipment])
async def get_all_shipments():
    """Fetch all active shipments (50 items)."""
    return mock_service.generate_shipments(count=50)

@router.get("/shipments/{id}", response_model=Shipment)
async def get_shipment_by_id(id: str):
    """Fetch a single shipment by ID."""
    shipments = mock_service.generate_shipments(count=100)
    shipment = next((s for s in shipments if s.id == id), None)
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment {id} not found")
    return shipment

@router.get("/metrics", response_model=SupplyChainMetrics)
async def get_global_metrics():
    """Fetch global supply chain performance metrics."""
    shipments = mock_service.generate_shipments(count=100)
    return mock_service.get_metrics(shipments)
