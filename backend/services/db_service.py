from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException
from postgrest.exceptions import APIError
from .supabase_client import get_supabase
from .mock_data import mock_service
import anyio


def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


class DBService:
    def __init__(self):
        self.use_mock = False
        try:
            self.supabase = get_supabase()
            print("✅ Supabase client initialized.")
        except Exception as e:
            print(
                f"⚠️ Supabase initialization failed: {e}. Falling back to In-Memory Mock mode."
            )
            self.supabase = None
            self.use_mock = True
            self._init_mock_data()

    def _init_mock_data(self):
        """Initialize in-memory data for fallback mode."""
        print("🛠️ Initializing in-memory fallback store...")
        shipments = mock_service.generate_shipments(50)
        self._shipments = [s.model_dump() for s in shipments]
        alerts = mock_service.generate_alerts(shipments)
        self._alerts = [a.model_dump() for a in alerts]
        self._metrics_history = []
        # Generate some history
        for i in range(7):
            m = mock_service.get_metrics(shipments).model_dump()
            m["snapshot_at"] = (
                datetime.utcnow() - timedelta(days=7 - i)
            ).isoformat() + "Z"
            self._metrics_history.append(m)
        self._optimizations = []
        print(
            f"✅ In-memory store ready with {len(self._shipments)} shipments and {len(self._alerts)} alerts."
        )

    def _handle_error(self, e: Exception):
        if self.use_mock:
            return
        if isinstance(e, APIError):
            print(f"Supabase API Error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        raise e

    def _map_shipment(self, s: dict) -> dict:
        """Map flat DB fields to nested Pydantic model structure."""
        if not s:
            return s

        # Build origin object
        if "origin_city" in s:
            s["origin"] = {
                "city": s.pop("origin_city"),
                "country": s.pop("origin_country", ""),
                "lat": s.pop("origin_lat", 0),
                "lng": s.pop("origin_lng", 0),
            }

        # Build destination object
        if "destination_city" in s:
            s["destination"] = {
                "city": s.pop("destination_city"),
                "country": s.pop("destination_country", ""),
                "lat": s.pop("destination_lat", 0),
                "lng": s.pop("destination_lng", 0),
            }

        # Build current_location object
        if s.get("current_city"):
            s["current_location"] = {
                "city": s.pop("current_city"),
                "country": s.pop("current_country", ""),
                "lat": s.pop("current_lat", 0),
                "lng": s.pop("current_lng", 0),
            }

        return s

    # SHIPMENTS
    async def get_all_shipments(
        self, status: str = None, mode: str = None, limit: int = 50
    ) -> List[dict]:
        if self.use_mock:
            data = self._shipments
            if status:
                data = [s for s in data if s["status"] == status]
            if mode:
                data = [s for s in data if s["mode"] == mode]
            return [self._map_shipment(s.copy()) for s in data[:limit]]

        try:
            client = get_supabase()

            def sync_query():
                query = client.table("shipments").select("*")
                if status:
                    query = query.eq("status", status)
                if mode:
                    query = query.eq("mode", mode)
                return query.limit(limit).execute()

            result = await anyio.to_thread.run_sync(sync_query)
            shipments = [self._map_shipment(s) for s in result.data]
            priority = {"critical": 0, "delayed": 1, "at_risk": 2, "on_time": 3}
            shipments.sort(key=lambda x: priority.get(x.get("status"), 4))
            return shipments
        except Exception as e:
            self._handle_error(e)
            return [self._map_shipment(s.copy()) for s in self._shipments[:limit]]

    async def get_shipment_by_id(self, shipment_id: str) -> dict:
        if self.use_mock:
            for s in self._shipments:
                if s["id"] == shipment_id:
                    return self._map_shipment(s.copy())
            raise HTTPException(status_code=404, detail="Shipment not found")

        try:
            client = get_supabase()
            result = await anyio.to_thread.run_sync(
                lambda: client.table("shipments")
                .select("*")
                .eq("id", shipment_id)
                .single()
                .execute()
            )
            return self._map_shipment(result.data)
        except Exception as e:
            if "matching no rows" in str(e):
                raise HTTPException(status_code=404, detail="Shipment not found")
            self._handle_error(e)

    async def upsert_shipments(self, shipments: List[dict]) -> int:
        if self.use_mock:
            # Simple in-memory upsert
            ids = [s["id"] for s in shipments]
            self._shipments = [s for s in self._shipments if s["id"] not in ids]
            self._shipments.extend(shipments)
            return len(shipments)

        try:
            client = get_supabase()
            result = await anyio.to_thread.run_sync(
                lambda: client.table("shipments")
                .upsert(shipments, on_conflict="id")
                .execute()
            )
            return len(result.data) if result.data else 0
        except Exception as e:
            self._handle_error(e)

    async def update_shipment_status(
        self, shipment_id: str, status: str, delay_hours: int = 0
    ) -> bool:
        if self.use_mock:
            for s in self._shipments:
                if s["id"] == shipment_id:
                    s["status"] = status
                    s["delay_hours"] = delay_hours
                    s["updated_at"] = now_iso()
                    return True
            return False

        try:
            client = get_supabase()
            data = {
                "status": status,
                "delay_hours": delay_hours,
                "updated_at": now_iso(),
            }
            result = await anyio.to_thread.run_sync(
                lambda: client.table("shipments")
                .update(data)
                .eq("id", shipment_id)
                .execute()
            )
            return len(result.data) > 0
        except Exception as e:
            self._handle_error(e)

    # DISRUPTION ALERTS
    async def get_all_alerts(
        self, resolved: bool = False, severity: str = None
    ) -> List[dict]:
        if self.use_mock:
            data = [a for a in self._alerts if a.get("resolved", False) == resolved]
            if severity:
                data = [a for a in data if a["severity"] == severity]
            return data

        try:
            client = get_supabase()

            def sync_query():
                query = (
                    client.table("disruption_alerts")
                    .select("*")
                    .eq("resolved", resolved)
                )
                if severity:
                    query = query.eq("severity", severity)
                return query.execute()

            result = await anyio.to_thread.run_sync(sync_query)
            return result.data or []
        except Exception as e:
            self._handle_error(e)
            return []

    async def insert_alert(self, alert: dict) -> dict:
        if self.use_mock:
            self._alerts.append(alert)
            return alert
        try:
            client = get_supabase()
            result = await anyio.to_thread.run_sync(
                lambda: client.table("disruption_alerts").insert(alert).execute()
            )
            return result.data[0] if result.data else {}
        except Exception as e:
            self._handle_error(e)

    async def insert_alerts(self, alerts: List[dict]) -> int:
        if self.use_mock:
            self._alerts.extend(alerts)
            return len(alerts)
        try:
            client = get_supabase()
            result = await anyio.to_thread.run_sync(
                lambda: client.table("disruption_alerts").insert(alerts).execute()
            )
            return len(result.data) if result.data else 0
        except Exception as e:
            self._handle_error(e)

    async def resolve_alert(self, alert_id: str) -> bool:
        if self.use_mock:
            for a in self._alerts:
                if a["id"] == alert_id:
                    a["resolved"] = True
                    a["resolved_at"] = now_iso()
                    return True
            return False
        try:
            client = get_supabase()
            data = {"resolved": True, "resolved_at": now_iso()}
            result = await anyio.to_thread.run_sync(
                lambda: client.table("disruption_alerts")
                .update(data)
                .eq("id", alert_id)
                .execute()
            )
            return len(result.data) > 0
        except Exception as e:
            self._handle_error(e)

    # ROUTE OPTIMIZATIONS
    async def save_optimization(self, opt: dict) -> dict:
        if self.use_mock:
            self._optimizations.append(opt)
            return opt
        try:
            client = get_supabase()
            result = await anyio.to_thread.run_sync(
                lambda: client.table("route_optimizations").insert(opt).execute()
            )
            return result.data[0] if result.data else {}
        except Exception as e:
            self._handle_error(e)

    async def get_optimizations_by_shipment(self, shipment_id: str) -> List[dict]:
        if self.use_mock:
            return [o for o in self._optimizations if o["shipment_id"] == shipment_id]
        try:
            client = get_supabase()
            result = await anyio.to_thread.run_sync(
                lambda: client.table("route_optimizations")
                .select("*")
                .eq("shipment_id", shipment_id)
                .execute()
            )
            return result.data or []
        except Exception as e:
            self._handle_error(e)

    async def accept_optimization(self, optimization_id: str) -> bool:
        if self.use_mock:
            for o in self._optimizations:
                if o.get("id") == optimization_id:
                    o["accepted"] = True
                    return True
            return False
        try:
            client = get_supabase()
            result = await anyio.to_thread.run_sync(
                lambda: client.table("route_optimizations")
                .update({"accepted": True})
                .eq("id", optimization_id)
                .execute()
            )
            return len(result.data) > 0
        except Exception as e:
            self._handle_error(e)

    # METRICS
    async def save_metrics_snapshot(self, metrics: dict) -> None:
        if self.use_mock:
            metrics["snapshot_at"] = now_iso()
            self._metrics_history.append(metrics)
            return
        try:
            client = get_supabase()
            # Map field names for DB
            db_metrics = metrics.copy()
            if "disruptions_detected_today" in db_metrics:
                db_metrics["disruptions_detected"] = db_metrics.pop(
                    "disruptions_detected_today"
                )
            if "routes_optimized_today" in db_metrics:
                db_metrics["routes_optimized"] = db_metrics.pop(
                    "routes_optimized_today"
                )

            db_metrics["snapshot_at"] = now_iso()
            await anyio.to_thread.run_sync(
                lambda: client.table("metrics_snapshots").insert(db_metrics).execute()
            )
        except Exception as e:
            self._handle_error(e)

    async def get_latest_metrics(self) -> Optional[dict]:
        if self.use_mock:
            return (
                self._map_metrics(self._metrics_history[-1].copy())
                if self._metrics_history
                else None
            )
        try:
            client = get_supabase()
            result = await anyio.to_thread.run_sync(
                lambda: client.table("metrics_snapshots")
                .select("*")
                .order("snapshot_at", desc=True)
                .limit(1)
                .execute()
            )
            if not result.data:
                return None

            return self._map_metrics(result.data[0])
        except Exception as e:
            self._handle_error(e)

    async def get_metrics_history(self, days: int = 7) -> List[dict]:
        if self.use_mock:
            return [self._map_metrics(m.copy()) for m in self._metrics_history[-days:]]
        try:
            client = get_supabase()
            from datetime import timedelta

            cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat() + "Z"
            result = await anyio.to_thread.run_sync(
                lambda: client.table("metrics_snapshots")
                .select("*")
                .gte("snapshot_at", cutoff)
                .order("snapshot_at", desc=False)
                .execute()
            )
            return [self._map_metrics(m) for m in (result.data or [])]
        except Exception as e:
            self._handle_error(e)
            return []

    def _map_metrics(self, m: dict) -> dict:
        """Map DB metrics field names to Pydantic names."""
        if "disruptions_detected" in m:
            m["disruptions_detected_today"] = m.pop("disruptions_detected")
        if "routes_optimized" in m:
            m["routes_optimized_today"] = m.pop("routes_optimized")
        return m

    # AI LOGS
    async def log_ai_call(
        self,
        analysis_type: str,
        input_summary: str,
        gemini_response: str,
        tokens_used: int,
        latency_ms: int,
    ) -> None:
        if self.use_mock:
            return
        try:
            client = get_supabase()
            data = {
                "analysis_type": analysis_type,
                "input_summary": input_summary,
                "gemini_response": gemini_response,
                "tokens_used": tokens_used,
                "latency_ms": latency_ms,
            }
            await anyio.to_thread.run_sync(
                lambda: client.table("ai_analysis_logs").insert(data).execute()
            )
        except Exception as e:
            # Don't fail the whole request if logging fails, but print it
            print(f"⚠️ Failed to log AI call: {e}")


db_service = DBService()
