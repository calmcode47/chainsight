from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from models.schemas import Shipment, SupplyChainMetrics
from services.db_service import DBService
from middleware.auth import require_auth

router = APIRouter()
db = DBService()


@router.get("/shipments", response_model=List[Shipment])
async def get_all_shipments(
    status: Optional[str] = Query(
        None, description="Filter by status (on_time, at_risk, delayed, critical)"
    ),
    mode: Optional[str] = Query(
        None, description="Filter by mode (air, sea, road, rail)"
    ),
    limit: int = Query(50, ge=1, le=200),
    user: dict = Depends(require_auth),
):
    """Fetch all shipments from Supabase with status and mode filtering."""
    return await db.get_all_shipments(status=status, mode=mode, limit=limit)


@router.get("/shipments/{shipment_id}", response_model=Shipment)
async def get_shipment_by_id(shipment_id: str, user: dict = Depends(require_auth)):
    """Fetch a single shipment from Supabase by its unique ID."""
    return await db.get_shipment_by_id(shipment_id)


@router.get("/metrics", response_model=SupplyChainMetrics)
async def get_global_metrics(user: dict = Depends(require_auth)):
    """
    Fetch the latest supply chain metrics from Supabase snapshots.
    """
    latest = await db.get_latest_metrics()
    if not latest:
        raise HTTPException(
            status_code=404, detail="No metrics found. Please seed the database."
        )
    return latest
