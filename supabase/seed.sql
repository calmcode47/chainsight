-- seed.sql
-- Seed data for ChainSight Supabase Database

-- Insert Sample Shipments
INSERT INTO shipments (
    id, origin_city, origin_country, origin_lat, origin_lng, 
    destination_city, destination_country, destination_lat, destination_lng,
    current_city, current_country, current_lat, current_lng,
    carrier, mode, status, eta, progress_percent, cargo_type, weight_kg, value_usd
) VALUES 
('SHP-10001', 'Shanghai', 'China', 31.2304, 121.4737, 'Rotterdam', 'Netherlands', 51.9225, 4.4792, 'Singapore', 'Singapore', 1.3521, 103.8198, 'Maersk', 'sea', 'on_time', NOW() + INTERVAL '12 days', 35, 'Electronics', 12500, 450000),
('SHP-10002', 'Shenzhen', 'China', 22.5431, 114.0579, 'Los Angeles', 'USA', 34.0522, -118.2437, 'Pacific Ocean', 'International', 20.0, -160.0, 'COSCO', 'sea', 'delayed', NOW() + INTERVAL '5 days', 85, 'Automotive', 8000, 1200000),
('SHP-10003', 'Mumbai', 'India', 19.0760, 72.8777, 'London', 'UK', 51.5074, -0.1278, 'Suez Canal', 'Egypt', 29.97, 32.54, 'MSC', 'sea', 'critical', NOW() + INTERVAL '3 days', 60, 'Pharmaceuticals', 1500, 2500000),
('SHP-10004', 'Berlin', 'Germany', 52.5200, 13.4050, 'Paris', 'France', 48.8566, 2.3522, 'Magdeburg', 'Germany', 52.12, 11.62, 'DHL', 'road', 'on_time', NOW() + INTERVAL '8 hours', 20, 'Retail', 500, 15000),
('SHP-10005', 'Tokyo', 'Japan', 35.6762, 139.6503, 'San Francisco', 'USA', 37.7749, -122.4194, 'In Transit', 'Air', 36.0, -150.0, 'FedEx', 'air', 'at_risk', NOW() + INTERVAL '14 hours', 45, 'High-Tech', 250, 85000),
('SHP-10006', 'Sao Paulo', 'Brazil', -23.5505, -46.6333, 'New York', 'USA', 40.7128, -74.0060, 'Santos Port', 'Brazil', -23.96, -46.33, 'Ocean Network Express', 'sea', 'on_time', NOW() + INTERVAL '18 days', 5, 'Coffee', 20000, 60000),
('SHP-10007', 'Seoul', 'South Korea', 37.5665, 126.9780, 'Hamburg', 'Germany', 53.5511, 9.9937, 'Indian Ocean', 'International', 5.0, 80.0, 'HMM', 'sea', 'delayed', NOW() + INTERVAL '9 days', 55, 'Consumer Goods', 5000, 120000),
('SHP-10008', 'Dubai', 'UAE', 25.2048, 55.2708, 'Chicago', 'USA', 41.8781, -87.6298, 'In Transit', 'Air', 50.0, -40.0, 'Emirates SkyCargo', 'air', 'on_time', NOW() + INTERVAL '10 hours', 75, 'Luxury Goods', 100, 350000),
('SHP-10009', 'Amsterdam', 'Netherlands', 52.3676, 4.9041, 'Madrid', 'Spain', 40.4168, -3.7038, 'Antwerp', 'Belgium', 51.21, 4.40, 'DB Schenker', 'rail', 'on_time', NOW() + INTERVAL '2 days', 15, 'Industrial Machinery', 12000, 500000),
('SHP-10010', 'Sydney', 'Australia', -33.8688, 151.2093, 'Vancouver', 'Canada', 49.2827, -123.1207, 'Pacific Ocean', 'International', -10.0, 170.0, 'Maersk', 'sea', 'at_risk', NOW() + INTERVAL '15 days', 30, 'Mining Equipment', 35000, 800000);

-- Insert Sample Alerts
INSERT INTO disruption_alerts (
    id, shipment_id, severity, type, description, detected_at, predicted_delay_hours, affected_region, ai_confidence
) VALUES 
('ALT-20481', 'SHP-10003', 'critical', 'Infrastructure', 'Major blockage in Suez Canal due to vessel grounding. Transit suspended indefinitely.', NOW() - INTERVAL '2 hours', 72, 'Suez Canal / Red Sea', 0.98),
('ALT-20482', 'SHP-10002', 'high', 'Weather', 'Severe typhoon warning in North Pacific. Vessel rerouting south to avoid storm core.', NOW() - INTERVAL '4 hours', 48, 'North Pacific Basin', 0.85),
('ALT-20483', 'SHP-10007', 'medium', 'Port Congestion', 'Labor strike at Port of Hamburg resulting in significant offloading bottlenecks.', NOW() - INTERVAL '1 day', 24, 'Northern Europe / Hamburg', 0.92),
('ALT-20484', 'SHP-10010', 'low', 'Technical', 'Minor engine maintenance required during scheduled bunker stop.', NOW() - INTERVAL '6 hours', 6, 'South Pacific', 0.75),
('ALT-20485', 'SHP-10005', 'medium', 'Customs', 'Unexpected regulatory audit for high-tech components at SFO cargo terminal.', NOW() - INTERVAL '3 hours', 12, 'North America / San Francisco', 0.88);
