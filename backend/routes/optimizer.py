from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Dict, Any
from models.schemas import RouteRecommendation
from services.db_service import DBService
from services.gemini_service import gemini_service
from middleware.auth import require_auth
import time

router = APIRouter()
db = DBService()

@router.post("/{shipment_id}", response_model=RouteRecommendation)
async def optimize_single_route(shipment_id: str, user: dict = Depends(require_auth)):
    """
    Generate an AI-optimized route for a specific shipment and save to Supabase.
    """
    # 1. Fetch shipment
    shipment = await db.get_shipment_by_id(shipment_id)
    
    start_time = time.time()
    
    # 2. Call Gemini
    recommendation = await gemini_service.optimize_route(shipment)
    
    latency = int((time.time() - start_time) * 1000)
    
    # 3. Log AI Call
    await db.log_ai_call(
        analysis_type="route_optimization",
        input_summary=f"Optimized route for {shipment_id}",
        gemini_response=str(recommendation),
        tokens_used=0,
        latency_ms=latency
    )
    
    # 4. Normalize and map response to schema
    rec = {
        "shipment_id": shipment_id,
        "original_route": shipment.get('route_nodes', []),
        "alternative_route": recommendation.get('alternative_route') or recommendation.get('alternative_waypoints') or [],
        "time_saving_hours": int(recommendation.get('time_saving_hours', 0)),
        "cost_delta_usd": float(recommendation.get('cost_delta_usd', 0.0)),
        "risk_reduction_percent": int(recommendation.get('risk_reduction_percent', recommendation.get('risk_reduction_pct', 0))),
        "recommended_carrier": str(recommendation.get('recommended_carrier') or recommendation.get('carrier_recommendation', 'Maersk')),
        "gemini_reasoning": str(recommendation.get('gemini_reasoning') or recommendation.get('reasoning') or "Optimized route suggested by AI.")
    }
    
    # 5. Save Optimization result
    await db.save_optimization(rec)
    
    return rec

@router.post("/{shipment_id}/accept")
async def accept_optimization(shipment_id: str, payload: Dict[str, Any] = Body(...), user: dict = Depends(require_auth)):
    """
    Mark an optimization as accepted and update shipment status.
    """
    optimization_id = payload.get("optimization_id")
    if not optimization_id:
        raise HTTPException(status_code=400, detail="optimization_id is required")
        
    success = await db.accept_optimization(optimization_id)
    if not success:
        raise HTTPException(status_code=404, detail="Optimization record not found")
        
    # Update shipment status to simulate route change
    shipment = await db.get_shipment_by_id(shipment_id)
    if shipment and shipment['status'] == 'critical':
        await db.update_shipment_status(shipment_id, 'at_risk', shipment['delay_hours'] // 2)
        
    return {"accepted": True, "shipment_id": shipment_id}

@router.get("/batch", response_model=List[Dict[str, Any]])
async def batch_optimize_at_risk_shipments(user: dict = Depends(require_auth)):
    """
    Run AI optimization for top at-risk/delayed shipments in batch.
    """
    shipments = await db.get_all_shipments(limit=100)
    at_risk = [s for s in shipments if s['status'] in ['delayed', 'critical']]
    
    results = []
    # Limit to 5 for demo performance/rate limits
    for s in at_risk[:5]:
        recommendation = await gemini_service.optimize_route(s)
        
        # Normalize
        rec = {
            "shipment_id": s['id'],
            "original_route": s.get('route_nodes', []),
            "alternative_route": recommendation.get('alternative_route') or recommendation.get('alternative_waypoints') or [],
            "time_saving_hours": int(recommendation.get('time_saving_hours', 0)),
            "cost_delta_usd": float(recommendation.get('cost_delta_usd', 0.0)),
            "risk_reduction_percent": int(recommendation.get('risk_reduction_percent', recommendation.get('risk_reduction_pct', 0))),
            "recommended_carrier": str(recommendation.get('recommended_carrier') or recommendation.get('carrier_recommendation', 'Maersk')),
            "gemini_reasoning": str(recommendation.get('gemini_reasoning') or recommendation.get('reasoning') or "Optimized route suggested by AI.")
        }
        
        # Save each
        await db.save_optimization(rec)
        
        results.append({
            "shipment_id": s['id'],
            "recommendation": rec
        })
        
    return results
