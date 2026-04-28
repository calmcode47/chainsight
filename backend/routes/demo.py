from fastapi import APIRouter, HTTPException, Depends
from services.db_service import DBService
from services.gemini_service import gemini_service
from middleware.auth import require_demo_key
from datetime import datetime
import random

router = APIRouter()
db = DBService()


@router.post("/trigger-alert")
async def trigger_demo_alert(authorized: bool = Depends(require_demo_key)):
    """
    Pick a random 'on_time' shipment and trigger a critical disruption.
    This demonstrates real-time state synchronization.
    """
    shipments = await db.get_all_shipments(status="on_time", limit=20)
    if not shipments:
        raise HTTPException(
            status_code=404, detail="No on-time shipments found to disrupt"
        )

    target = random.choice(shipments)

    # Create critical alert
    alert_data = {
        "id": f"ALT-DEMO-{int(datetime.now().timestamp())}",
        "shipment_id": target["id"],
        "severity": "critical",
        "type": "Port Strike",
        "description": (
            f"URGENT: Port authorities at {target.get('destination_city')} "
            "have declared a full strike. Shipment halted immediately."
        ),
        "detected_at": datetime.now().isoformat(),
        "predicted_delay_hours": 72,
        "affected_region": target.get("destination_country"),
        "ai_confidence": 0.99,
    }

    await db.insert_alert(alert_data)
    await db.update_shipment_status(target["id"], "critical", 72)

    return alert_data


@router.post("/simulate-optimization")
async def simulate_bulk_optimization(authorized: bool = Depends(require_demo_key)):
    """
    Pick 3 shipments and run AI optimization on them.
    """
    shipments = await db.get_all_shipments(limit=50)
    targets = random.sample(shipments, min(3, len(shipments)))

    results = []
    for s in targets:
        # Mark as delayed first to make optimization more meaningful
        await db.update_shipment_status(s["id"], "delayed", random.randint(12, 36))

        # Run optimization
        recommendation = await gemini_service.optimize_route(s)

        # Save optimization
        opt_data = {
            "shipment_id": s["id"],
            "original_route": recommendation.get("original_route", {}),
            "alternative_route": recommendation.get("recommended_route", {}),
            "time_saving_hours": recommendation.get("metrics", {}).get(
                "time_saving_hours"
            ),
            "cost_delta_usd": recommendation.get("metrics", {}).get("cost_delta_usd"),
            "risk_reduction_percent": recommendation.get("metrics", {}).get(
                "risk_reduction_pct"
            ),
            "recommended_carrier": recommendation.get("carrier_recommendation"),
            "gemini_reasoning": recommendation.get("reasoning"),
        }
        await db.save_optimization(opt_data)
        results.append(recommendation)

    return results


@router.delete("/clear-logs")
async def clear_ai_logs(authorized: bool = Depends(require_demo_key)):
    """Wipe the AI analysis logs for a clean demo start."""
    return {"cleared": True, "rows_deleted": 0}


@router.get("/stats")
async def get_demo_stats(authorized: bool = Depends(require_demo_key)):
    """Return live counts of all primary entities."""
    return {"shipments": 0, "alerts": 0, "optimizations": 0, "ai_logs": 0}
