from .db_service import DBService
from .mock_data import MockDataService
import json

def flatten_shipment(s: dict) -> dict:
    """Converts nested GeoPoint dicts to flat columns for Supabase."""
    flat = s.copy()
    
    # Origin
    origin = flat.pop("origin", {})
    flat["origin_city"] = origin.get("city")
    flat["origin_country"] = origin.get("country")
    flat["origin_lat"] = origin.get("lat")
    flat["origin_lng"] = origin.get("lng")
    
    # Destination
    dest = flat.pop("destination", {})
    flat["destination_city"] = dest.get("city")
    flat["destination_country"] = dest.get("country")
    flat["destination_lat"] = dest.get("lat")
    flat["destination_lng"] = dest.get("lng")
    
    # Current Location
    curr = flat.pop("current_location", {})
    if curr:
        flat["current_city"] = curr.get("city")
        flat["current_country"] = curr.get("country")
        flat["current_lat"] = curr.get("lat")
        flat["current_lng"] = curr.get("lng")
    else:
        flat["current_city"] = None
        flat["current_country"] = None
        flat["current_lat"] = None
        flat["current_lng"] = None
        
    return flat

class SeedService:
    async def seed_database(self, force: bool = False) -> dict:
        db = DBService()
        mock = MockDataService()
        
        if not force:
            existing = await db.get_all_shipments(limit=1)
            if existing:
                return {"seeded": False, "reason": "Data already exists. Use force=true to reseed."}
        
        shipments = mock.generate_shipments(50)
        shipment_dicts = [s.model_dump() for s in shipments]
        flat_shipments = [flatten_shipment(s) for s in shipment_dicts]
        
        count = await db.upsert_shipments(flat_shipments)
        
        alerts = mock.generate_alerts(shipments)
        alert_dicts = [a.model_dump() for a in alerts]
        await db.insert_alerts(alert_dicts)
            
        metrics = mock.get_metrics(shipments)
        await db.save_metrics_snapshot(metrics.model_dump())
        
        return {
            "seeded": True, 
            "shipments": count, 
            "alerts": len(alerts)
        }
