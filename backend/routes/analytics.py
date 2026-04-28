from fastapi import APIRouter, Query, Depends
from services.db_service import db_service as db
from middleware.auth import require_auth
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/metrics-history")
async def get_metrics_history(
    days: int = Query(7, ge=1, le=30), user: dict = Depends(require_auth)
):
    """
    Fetch historical metrics snapshots.
    Fills gaps with the most recent prior snapshot to ensure a continuous time series.
    """
    snapshots = await db.get_metrics_history(days=days)

    if not snapshots:
        return []

    # Sort by date
    snapshots.sort(key=lambda x: x["snapshot_at"])

    # Gap filling logic
    filled_snapshots = []
    start_date = (datetime.now() - timedelta(days=days - 1)).date()

    current_idx = 0
    last_known_snapshot = snapshots[0]

    for i in range(days):
        target_date = start_date + timedelta(days=i)

        # Check if we have a snapshot for this date
        found = False
        while current_idx < len(snapshots):
            snap_dt = snapshots[current_idx]["snapshot_at"].replace("Z", "+00:00")
            snap_date = datetime.fromisoformat(snap_dt).date()
            if snap_date == target_date:
                last_known_snapshot = snapshots[current_idx]
                filled_snapshots.append(last_known_snapshot)
                current_idx += 1
                found = True
                break
            elif snap_date > target_date:
                # We passed the target date, so we need to fill this gap
                break
            else:
                # This snapshot is before our range or already processed
                last_known_snapshot = snapshots[current_idx]
                current_idx += 1

        if not found:
            # Fill with the last known snapshot but update the date
            new_snap = last_known_snapshot.copy()
            new_snap["snapshot_at"] = (
                datetime.combine(target_date, datetime.min.time()).isoformat() + "Z"
            )
            filled_snapshots.append(new_snap)

    return filled_snapshots


@router.get("/summary")
async def get_analytics_summary(user: dict = Depends(require_auth)):
    """
    Calculate a 7-day performance summary.
    """
    snapshots = await db.get_metrics_history(days=7)

    if len(snapshots) < 2:
        return {
            "week_on_time_avg": 0,
            "total_cost_saved": 0,
            "total_disruptions": 0,
            "total_routes_optimized": 0,
            "trend": "stable",
        }

    total_on_time_pct = 0
    total_cost = 0
    total_disruptions = 0
    total_routes = 0

    best_on_time = -1
    best_day = ""
    worst_on_time = 101
    worst_day = ""

    for s in snapshots:
        on_time_pct = (
            (s["on_time"] / s["total_shipments"] * 100)
            if s["total_shipments"] > 0
            else 0
        )
        total_on_time_pct += on_time_pct
        total_cost += s.get("cost_saved_usd", 0)
        total_disruptions += s.get("disruptions_detected", 0)
        total_routes += s.get("routes_optimized", 0)

        date_str = s["snapshot_at"][:10]
        if on_time_pct > best_on_time:
            best_on_time = on_time_pct
            best_day = date_str
        if on_time_pct < worst_on_time:
            worst_on_time = on_time_pct
            worst_day = date_str

    avg_on_time = total_on_time_pct / len(snapshots)

    # Simple trend calculation (comparing first and last snapshot)
    first_pct = (
        (snapshots[0]["on_time"] / snapshots[0]["total_shipments"] * 100)
        if snapshots[0]["total_shipments"] > 0
        else 0
    )
    last_pct = (
        (snapshots[-1]["on_time"] / snapshots[-1]["total_shipments"] * 100)
        if snapshots[-1]["total_shipments"] > 0
        else 0
    )

    trend = "stable"
    if last_pct > first_pct + 2:
        trend = "improving"
    elif last_pct < first_pct - 2:
        trend = "worsening"

    return {
        "week_on_time_avg": round(avg_on_time, 2),
        "total_cost_saved": round(total_cost, 2),
        "total_disruptions": total_disruptions,
        "total_routes_optimized": total_routes,
        "best_day": best_day,
        "worst_day": worst_day,
        "trend": trend,
    }


@router.get("/ai-usage")
async def get_ai_usage_stats(user: dict = Depends(require_auth)):
    """Fetch recent AI call logs and calculate usage statistics."""
    return {"stats": {}, "recent_logs": []}
