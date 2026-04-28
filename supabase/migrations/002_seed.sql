-- ChainSight Seed Data
-- Deliverable: supabase/migrations/002_seed.sql

-- Clear existing seed data to prevent duplicates (optional, but good for clean runs)
-- DELETE FROM disruption_alerts;
-- DELETE FROM shipments;
-- DELETE FROM metrics_snapshots;

-- 1. Insert 15 Realistic Shipments
INSERT INTO shipments (
  id, origin_city, origin_country, origin_lat, origin_lng,
  destination_city, destination_country, destination_lat, destination_lng,
  carrier, mode, status, eta, progress_percent, cargo_type, weight_kg, value_usd,
  current_city, current_country, current_lat, current_lng, route_nodes
) VALUES
-- Sea Shipments (Major Routes)
('SHP-001', 'Shanghai', 'China', 31.2304, 121.4737, 'Los Angeles', 'USA', 34.0522, -118.2437, 'Maersk', 'sea', 'on_time', NOW() + INTERVAL '12 days', 45, 'Electronics', 24000, 1200000, 'Pacific Ocean', 'International Waters', 32.5, 160.0, '[{"name": "Shanghai Port"}, {"name": "Pacific Transit"}, {"name": "LA Port"}]'),
('SHP-002', 'Singapore', 'Singapore', 1.3521, 103.8198, 'Rotterdam', 'Netherlands', 51.9225, 4.4792, 'MSC', 'sea', 'delayed', NOW() + INTERVAL '18 days', 30, 'Industrial Machinery', 45000, 3500000, 'Indian Ocean', 'International Waters', 5.0, 80.0, '[{"name": "Singapore Terminal"}, {"name": "Malacca Strait"}, {"name": "Suez Canal"}, {"name": "Rotterdam"}]'),
('SHP-003', 'Busan', 'South Korea', 35.1796, 129.0756, 'Hamburg', 'Germany', 53.5511, 9.9937, 'Hapag-Lloyd', 'sea', 'at_risk', NOW() + INTERVAL '22 days', 15, 'Automotive Parts', 18000, 850000, 'East China Sea', 'International Waters', 28.0, 125.0, '[{"name": "Busan Port"}, {"name": "South China Sea"}, {"name": "Hamburg Terminal"}]'),
('SHP-004', 'Santos', 'Brazil', -23.9608, -46.3339, 'Savannah', 'USA', 32.0809, -81.0912, 'CMA CGM', 'sea', 'on_time', NOW() + INTERVAL '8 days', 65, 'Coffee Beans', 22000, 450000, 'Atlantic Ocean', 'International Waters', 10.0, -50.0, '[{"name": "Santos Port"}, {"name": "Equator Crossing"}, {"name": "Savannah Terminal"}]'),

-- Air Shipments (High Value)
('SHP-005', 'Tokyo', 'Japan', 35.6762, 139.6503, 'London', 'UK', 51.5074, -0.1278, 'FedEx', 'air', 'on_time', NOW() + INTERVAL '1 day', 85, 'Pharmaceuticals', 500, 250000, 'Anchorage', 'USA', 61.2181, -149.9003, '[{"name": "Narita"}, {"name": "Anchorage Hub"}, {"name": "Heathrow"}]'),
('SHP-006', 'Dubai', 'UAE', 25.2048, 55.2708, 'New York', 'USA', 40.7128, -74.0060, 'Emirates SkyCargo', 'air', 'critical', NOW() + INTERVAL '2 days', 50, 'Luxury Goods', 1200, 1500000, 'Paris', 'France', 48.8566, 2.3522, '[{"name": "Dubai World Central"}, {"name": "Charles de Gaulle Transit"}, {"name": "JFK"}]'),
('SHP-007', 'San Francisco', 'USA', 37.7749, -122.4194, 'Seoul', 'South Korea', 37.5665, 126.9780, 'UPS', 'air', 'on_time', NOW() + INTERVAL '18 hours', 90, 'Semiconductors', 300, 5000000, 'Incheon', 'South Korea', 37.4602, 126.4407, '[{"name": "SFO"}, {"name": "ICN"}]'),

-- Road Shipments (Regional)
('SHP-008', 'Berlin', 'Germany', 52.5200, 13.4050, 'Warsaw', 'Poland', 52.2297, 21.0122, 'DHL', 'road', 'on_time', NOW() + INTERVAL '12 hours', 40, 'Consumer Goods', 5000, 120000, 'Poznan', 'Poland', 52.4064, 16.9252, '[{"name": "Berlin Warehouse"}, {"name": "A2 Motorway"}, {"name": "Warsaw Hub"}]'),
('SHP-009', 'Laredo', 'USA', 27.5036, -99.5076, 'Monterrey', 'Mexico', 25.6866, -100.3161, 'Swift', 'road', 'delayed', NOW() + INTERVAL '6 hours', 75, 'Textiles', 12000, 85000, 'Nuevo Laredo', 'Mexico', 27.4763, -99.5164, '[{"name": "Laredo Border"}, {"name": "Customs Checkpoint"}, {"name": "Monterrey DC"}]'),
('SHP-010', 'Paris', 'France', 48.8566, 2.3522, 'Milan', 'Italy', 45.4642, 9.1899, 'Kuehne + Nagel', 'road', 'at_risk', NOW() + INTERVAL '1 day', 20, 'Fashion', 3500, 650000, 'Lyon', 'France', 45.7640, 4.8357, '[{"name": "Paris Nord"}, {"name": "Lyon Transit"}, {"name": "Mont Blanc Tunnel"}, {"name": "Milan"}]'),

-- Rail Shipments (Transcontinental)
('SHP-011', 'Chengdu', 'China', 30.5728, 104.0668, 'Lodz', 'Poland', 51.7592, 19.4560, 'China Railway', 'rail', 'on_time', NOW() + INTERVAL '14 days', 55, 'Solar Panels', 30000, 2000000, 'Almaty', 'Kazakhstan', 43.2389, 76.8897, '[{"name": "Chengdu Station"}, {"name": "Dostyk Crossing"}, {"name": "Lodz Terminal"}]'),
('SHP-012', 'Moscow', 'Russia', 55.7558, 37.6173, 'Beijing', 'China', 39.9042, 116.4074, 'RZD', 'rail', 'delayed', NOW() + INTERVAL '10 days', 40, 'Raw Materials', 60000, 150000, 'Irkutsk', 'Russia', 52.2870, 104.3050, '[{"name": "Moscow Hub"}, {"name": "Trans-Siberian Way"}, {"name": "Beijing North"}]'),

-- More Sea (Edge Cases)
('SHP-013', 'Mumbai', 'India', 19.0760, 72.8777, 'New York', 'USA', 40.7128, -74.0060, 'HMM', 'sea', 'critical', NOW() + INTERVAL '25 days', 10, 'Handicrafts', 15000, 250000, 'Arabian Sea', 'International Waters', 18.0, 65.0, '[{"name": "JNPT Port"}, {"name": "Suez Canal"}, {"name": "NY Harbor"}]'),
('SHP-014', 'Melbourne', 'Australia', -37.8136, 144.9631, 'Osaka', 'Japan', 34.6937, 135.5023, 'ONE', 'sea', 'on_time', NOW() + INTERVAL '15 days', 30, 'Wine', 10000, 300000, 'Coral Sea', 'International Waters', -15.0, 150.0, '[{"name": "Port of Melbourne"}, {"name": "Great Barrier Reef"}, {"name": "Osaka Port"}]'),
('SHP-015', 'Cape Town', 'South Africa', -33.9249, 18.4241, 'Lisbon', 'Portugal', 38.7223, -9.1393, 'Maersk', 'sea', 'on_time', NOW() + INTERVAL '20 days', 5, 'Fruit', 12000, 180000, 'Atlantic Ocean', 'South Africa Coast', -30.0, 15.0, '[{"name": "Cape Town Port"}, {"name": "West Africa Transit"}, {"name": "Lisbon Port"}]');

-- 2. Insert 8 Realistic Disruption Alerts
INSERT INTO disruption_alerts (
  id, shipment_id, severity, type, description, detected_at, predicted_delay_hours, affected_region, ai_confidence, resolved
) VALUES
('ALT-001', 'SHP-002', 'high', 'Port Congestion', 'Severe backlog at Suez Canal due to high traffic volume.', NOW() - INTERVAL '6 hours', 48, 'Suez Canal', 0.95, FALSE),
('ALT-002', 'SHP-003', 'medium', 'Weather', 'Heavy storm in the East China Sea affecting vessel speed.', NOW() - INTERVAL '12 hours', 24, 'East China Sea', 0.88, FALSE),
('ALT-003', 'SHP-006', 'critical', 'Airport Strike', 'Ground crew strike at Charles de Gaulle Airport.', NOW() - INTERVAL '2 hours', 72, 'Paris, FR', 0.98, FALSE),
('ALT-004', 'SHP-009', 'medium', 'Border Delay', 'Customs system outage at Laredo/Nuevo Laredo crossing.', NOW() - INTERVAL '4 hours', 12, 'US-Mexico Border', 0.75, FALSE),
('ALT-005', 'SHP-010', 'low', 'Maintenance', 'Mont Blanc Tunnel scheduled maintenance reducing traffic flow.', NOW() - INTERVAL '1 day', 4, 'Alps Region', 0.90, FALSE),
('ALT-006', 'SHP-012', 'high', 'Rail Blockage', 'Track damage detected on the Trans-Siberian Railway near Lake Baikal.', NOW() - INTERVAL '2 days', 96, 'Siberia, RU', 0.82, FALSE),
('ALT-007', 'SHP-013', 'critical', 'Port Strike', 'Unannounced labor strike at Mumbai JNPT Port.', NOW() - INTERVAL '5 hours', 120, 'Mumbai, IN', 0.99, FALSE),
('ALT-008', 'SHP-015', 'low', 'Equipment Alert', 'Minor engine issue detected; vessel speed reduced by 15%.', NOW() - INTERVAL '8 hours', 36, 'South Atlantic', 0.65, FALSE);

-- 3. Insert 7 Metrics Snapshots (Last 7 Days)
INSERT INTO metrics_snapshots (
  snapshot_at, total_shipments, on_time, at_risk, delayed, critical, avg_delay_hours, disruptions_detected, routes_optimized, cost_saved_usd
) VALUES
(NOW() - INTERVAL '6 days', 142, 110, 20, 10, 2, 4.5, 1, 5, 12500),
(NOW() - INTERVAL '5 days', 145, 115, 15, 12, 3, 5.2, 2, 8, 18000),
(NOW() - INTERVAL '4 days', 140, 105, 22, 10, 3, 4.8, 1, 4, 9000),
(NOW() - INTERVAL '3 days', 148, 100, 25, 18, 5, 8.5, 4, 12, 35000),
(NOW() - INTERVAL '2 days', 150, 95, 30, 20, 5, 10.2, 3, 15, 42000),
(NOW() - INTERVAL '1 day', 152, 98, 28, 21, 5, 11.5, 2, 10, 28000),
(NOW(), 155, 102, 25, 23, 5, 12.1, 8, 22, 54000);
