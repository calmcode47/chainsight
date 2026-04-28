import random
from typing import List, Optional
from datetime import datetime, timedelta
from faker import Faker
from models.schemas import GeoPoint, Shipment, DisruptionAlert, SupplyChainMetrics

fake = Faker()
random.seed(42) # Deterministic for session stability

class MockDataService:
    CITY_PAIRS = [
        {"origin": {"city": "Shanghai", "country": "China", "lat": 31.2304, "lng": 121.4737}, 
         "dest": {"city": "Los Angeles", "country": "USA", "lat": 34.0522, "lng": -118.2437}},
        {"origin": {"city": "Mumbai", "country": "India", "lat": 19.0760, "lng": 72.8777}, 
         "dest": {"city": "Rotterdam", "country": "Netherlands", "lat": 51.9225, "lng": 4.4792}},
        {"origin": {"city": "Dubai", "country": "UAE", "lat": 25.2048, "lng": 55.2708}, 
         "dest": {"city": "New York", "country": "USA", "lat": 40.7128, "lng": -74.0060}},
        {"origin": {"city": "Singapore", "country": "Singapore", "lat": 1.3521, "lng": 103.8198}, 
         "dest": {"city": "Hamburg", "country": "Germany", "lat": 53.5511, "lng": 9.9937}},
        {"origin": {"city": "Tokyo", "country": "Japan", "lat": 35.6762, "lng": 139.6503}, 
         "dest": {"city": "London", "country": "UK", "lat": 51.5074, "lng": -0.1278}},
        {"origin": {"city": "Santos", "country": "Brazil", "lat": -23.9608, "lng": -46.3339}, 
         "dest": {"city": "Antwerp", "country": "Belgium", "lat": 51.2194, "lng": 4.4025}},
        {"origin": {"city": "Busan", "country": "South Korea", "lat": 35.1796, "lng": 129.0756}, 
         "dest": {"city": "Savannah", "country": "USA", "lat": 32.0809, "lng": -81.0912}},
    ]

    CARRIERS = ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "Evergreen", "FedEx", "DHL", "UPS", "Ocean Network Express"]
    MODES = ["air", "sea", "road", "rail"]
    CARGO_TYPES = ["electronics", "pharmaceuticals", "automotive", "perishables", "general"]
    DISRUPTION_TYPES = ["weather", "port_congestion", "customs", "mechanical"]

    def generate_shipments(self, count: int = 50) -> List[Shipment]:
        shipments = []
        for i in range(count):
            pair = random.choice(self.CITY_PAIRS)
            origin_geo = GeoPoint(**pair["origin"])
            dest_geo = GeoPoint(**pair["dest"])
            
            # Weighted status distribution
            status = random.choices(
                ["on_time", "at_risk", "delayed", "critical"], 
                weights=[0.70, 0.15, 0.10, 0.05]
            )[0]
            
            # Generate ETA (1-30 days from now)
            days_to_eta = random.randint(1, 30)
            eta_dt = datetime.now() + timedelta(days=days_to_eta)
            
            # Progress correlates with ETA (closer ETA = higher progress)
            # Max 30 days. If 1 day left, progress should be high (80-99%). 
            # If 30 days left, progress should be low (1-10%).
            progress = int(max(0, min(100, (31 - days_to_eta) / 31 * 100 + random.randint(-10, 10))))
            
            # Current location: interpolate between origin and dest based on progress
            # Simplified: just pick origin, dest or a mid-point
            if progress < 10:
                current_geo = origin_geo
            elif progress > 90:
                current_geo = dest_geo
            else:
                current_geo = GeoPoint(
                    lat=origin_geo.lat + (dest_geo.lat - origin_geo.lat) * (progress/100),
                    lng=origin_geo.lng + (dest_geo.lng - origin_geo.lng) * (progress/100),
                    city="In Transit",
                    country="International Waters/Airspace"
                )

            delay_hours = 0
            disruption = None
            if status != "on_time":
                disruption = random.choice(self.DISRUPTION_TYPES)
                delay_hours = random.randint(4, 72) if status == "at_risk" else random.randint(72, 240)

            shipments.append(Shipment(
                id=f"SHP-{10000 + i}",
                origin=origin_geo,
                destination=dest_geo,
                current_location=current_geo,
                carrier=random.choice(self.CARRIERS),
                mode=random.choice(self.MODES),
                status=status,
                eta=eta_dt.isoformat(),
                progress_percent=progress,
                cargo_type=random.choice(self.CARGO_TYPES),
                weight_kg=round(random.uniform(500, 50000), 2),
                value_usd=round(random.uniform(5000, 1000000), 2),
                delay_hours=delay_hours,
                disruption_type=disruption,
                route_nodes=[origin_geo, current_geo, dest_geo]
            ))
        return shipments

    def generate_alerts(self, shipments: List[Shipment]) -> List[DisruptionAlert]:
        alerts = []
        for shp in shipments:
            if shp.status == "on_time":
                continue
            
            severity = "low"
            if shp.status == "critical": severity = "critical"
            elif shp.status == "delayed": severity = "high"
            elif shp.status == "at_risk": severity = "medium"

            desc_templates = {
                "weather": "Severe {storm_type} system detected near {loc} affecting maritime routes.",
                "port_congestion": "Increased vessel dwell times at {loc} causing backlog of {hours}h.",
                "customs": "New regulatory audits at {loc} customs clearance causing processing delays.",
                "mechanical": "Carrier {carrier} reports technical issues with vessel serving shipment {id}."
            }
            
            storm_types = ["typhoon", "cyclone", "blizzard", "high-wind"]
            desc = desc_templates.get(shp.disruption_type, "Unforeseen disruption at {loc}.").format(
                storm_type=random.choice(storm_types),
                loc=shp.current_location.city if shp.current_location.city != "In Transit" else shp.destination.city,
                hours=shp.delay_hours,
                carrier=shp.carrier,
                id=shp.id
            )

            alerts.append(DisruptionAlert(
                id=f"ALT-{random.randint(1000, 9999)}",
                shipment_id=shp.id,
                severity=severity,
                type=shp.disruption_type or "unknown",
                description=desc,
                detected_at=datetime.now().isoformat(),
                predicted_delay_hours=shp.delay_hours,
                affected_region=shp.current_location.country,
                ai_confidence=round(random.uniform(0.75, 0.99), 2)
            ))
        return alerts

    def get_metrics(self, shipments: List[Shipment]) -> SupplyChainMetrics:
        on_time = sum(1 for s in shipments if s.status == "on_time")
        at_risk = sum(1 for s in shipments if s.status == "at_risk")
        delayed = sum(1 for s in shipments if s.status == "delayed")
        critical = sum(1 for s in shipments if s.status == "critical")
        
        total_delay = sum(s.delay_hours for s in shipments)
        avg_delay = total_delay / len(shipments) if shipments else 0
        
        # Simulated daily stats
        return SupplyChainMetrics(
            total_shipments=len(shipments),
            on_time=on_time,
            at_risk=at_risk,
            delayed=delayed,
            critical=critical,
            avg_delay_hours=round(avg_delay, 1),
            disruptions_detected_today=at_risk + delayed + critical,
            routes_optimized_today=random.randint(5, 15),
            cost_saved_usd=round(random.uniform(10000, 50000), 2)
        )

# Export a default instance
mock_service = MockDataService()
