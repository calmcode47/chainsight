import asyncio
import random
from datetime import datetime
from services.db_service import DBService

class RealtimeService:
    def __init__(self):
        self.db = DBService()

    async def simulate_status_changes(self):
        """Periodically update random shipments to 'at_risk' or 'delayed' to trigger realtime events."""
        while True:
            try:
                await asyncio.sleep(45) # Every 45 seconds
                print("🔄 [Realtime Sim] Triggering shipment status update...")
                
                # Fetch current 'on_time' shipments
                shipments = await self.db.get_all_shipments(status='on_time', limit=10)
                if shipments:
                    target = random.choice(shipments)
                    new_status = random.choice(['at_risk', 'delayed'])
                    new_delay = random.randint(4, 24)
                    
                    await self.db.update_shipment_status(target['id'], new_status, new_delay)
                    print(f"✅ [Realtime Sim] Shipment {target['id']} moved to {new_status}")
            except Exception as e:
                print(f"❌ [Realtime Sim] Status update failed: {e}")

    async def simulate_new_alert(self):
        """Periodically insert new disruption alerts to trigger frontend notifications."""
        while True:
            try:
                await asyncio.sleep(60) # Every 60 seconds
                print("🚨 [Realtime Sim] Generating new disruption alert...")
                
                # Fetch an at_risk or delayed shipment to attach alert to
                shipments = await self.db.get_all_shipments(limit=50)
                at_risk = [s for s in shipments if s['status'] in ['at_risk', 'delayed', 'critical']]
                
                if at_risk:
                    target = random.choice(at_risk)
                    
                    alert_types = ['Weather', 'Customs', 'Infrastructure', 'Port Congestion']
                    alert_type = random.choice(alert_types)
                    
                    new_alert = {
                        "id": f"ALT-{int(datetime.now().timestamp())}",
                        "shipment_id": target['id'],
                        "severity": random.choice(['medium', 'high', 'critical']),
                        "type": alert_type,
                        "description": f"Live simulation: {alert_type} disruption detected affecting {target['id']}.",
                        "detected_at": datetime.now().isoformat(),
                        "predicted_delay_hours": random.randint(6, 48),
                        "affected_region": target.get('current_location', {}).get('country') or "Global",
                        "ai_confidence": round(random.uniform(0.7, 0.99), 2)
                    }
                    
                    await self.db.insert_alert(new_alert)
                    print(f"✅ [Realtime Sim] New {new_alert['severity']} alert created for {target['id']}")
            except Exception as e:
                print(f"❌ [Realtime Sim] Alert generation failed: {e}")

realtime_service = RealtimeService()
