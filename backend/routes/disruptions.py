from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from models.schemas import DisruptionAlert
from services.db_service import DBService
from services.gemini_service import gemini_service
from middleware.auth import require_auth
import time
import random

router = APIRouter()
db = DBService()


@router.get("", response_model=List[DisruptionAlert])
async def get_all_disruptions(
    resolved: bool = Query(False, description="Filter by resolution status"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    user: dict = Depends(require_auth),
):
    """Fetch active or resolved disruption alerts from Supabase."""
    return await db.get_all_alerts(resolved=resolved, severity=severity)


@router.post("/analyze")
async def analyze_shipment_disruptions(user: dict = Depends(require_auth)):
    """
    Triggers a Gemini AI analysis of current shipments to detect high-risk patterns.
    Identified patterns are inserted as new alerts into Supabase.
    """
    # 1. Fetch current shipments
    shipments = await db.get_all_shipments(limit=100)

    start_time = time.time()

    # 2. Call Gemini
    analysis = await gemini_service.analyze_disruptions(shipments)

    latency = int((time.time() - start_time) * 1000)

    # 3. Log AI Call
    await db.log_ai_call(
        analysis_type="disruption_analysis",
        input_summary=f"Analyzed {len(shipments)} shipments",
        gemini_response=str(analysis),
        tokens_used=0,  # Estimated or fixed for demo
        latency_ms=latency,
    )

    # 4. Insert findings as alerts if high/critical
    new_alerts_count = 0
    for finding in analysis:
        if finding.get("severity") in ["high", "critical"]:
            alert_data = {
                "id": f"ALT-{int(time.time())}-{random.randint(100, 999)}",
                "shipment_id": finding.get("affected_shipments", [""])[
                    0
                ],  # Use first affected ID
                "severity": finding.get("severity"),
                "type": finding.get("type"),
                "description": finding.get(
                    "recommended_action", "AI identified disruption"
                ),
                "affected_region": "Global",  # AI could determine this more specifically
                "ai_confidence": 0.95,
                "detected_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            try:
                await db.insert_alert(alert_data)
                new_alerts_count += 1
            except Exception:
                pass  # Skip if duplicate or shipment ID invalid

    return {
        "disruptions": analysis,
        "new_alerts_created": new_alerts_count,
        "summary": f"Identified {len(analysis)} risk patterns. Created {new_alerts_count} critical alerts.",
    }


@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: str, user: dict = Depends(require_auth)):
    """Mark a disruption alert as resolved in Supabase."""
    success = await db.resolve_alert(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return {"resolved": True, "alert_id": alert_id}
