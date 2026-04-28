import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "version" in data

@pytest.mark.asyncio
async def test_get_shipments(client):
    # Mock DBService to return at least one shipment
    with patch("services.db_service.db_service.get_all_shipments", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = [{
            "id": "SHP-TEST",
            "origin_city": "London",
            "destination_city": "New York",
            "status": "on_time",
            "carrier": "Maersk",
            "mode": "sea",
            "eta": "2026-05-01",
            "delay_hours": 0,
            "progress_percent": 50,
            "origin_lat": 0, "origin_lng": 0,
            "destination_lat": 0, "destination_lng": 0,
            "route_nodes": []
        }]
        response = await client.get("/api/shipments")
        assert response.status_code == 200
        assert len(response.json()) >= 1
        assert response.json()[0]["id"] == "SHP-TEST"

@pytest.mark.asyncio
async def test_get_metrics(client):
    with patch("services.db_service.db_service.get_latest_metrics", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = {
            "snapshot_at": "2026-04-28T00:00:00Z",
            "total_shipments": 100,
            "on_time": 80,
            "at_risk": 10,
            "delayed": 5,
            "critical": 5,
            "avg_delay_hours": 2.5,
            "disruptions_detected": 3,
            "routes_optimized": 12,
            "cost_saved_usd": 4500
        }
        response = await client.get("/api/metrics")
        assert response.status_code == 200
        assert response.json()["total_shipments"] == 100

@pytest.mark.asyncio
async def test_get_shipment_not_found(client):
    with patch("services.db_service.db_service.get_shipment_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None
        response = await client.get("/api/shipments/INVALID")
        assert response.status_code == 404

@pytest.mark.asyncio
async def test_optimize_route(client):
    # Mock shipment fetch
    with patch("services.db_service.db_service.get_shipment_by_id", new_callable=AsyncMock) as mock_ship:
        mock_ship.return_value = {"id": "SHP-123", "status": "delayed"}
        
        # Mock Gemini call
        with patch("services.gemini_service.gemini_service.optimize_route", new_callable=AsyncMock) as mock_gemini:
            mock_gemini.return_value = {
                "original_route": {"nodes": []},
                "recommended_route": {"nodes": []},
                "metrics": {"time_saving_hours": 5, "cost_delta_usd": -200, "risk_reduction_pct": 20},
                "carrier_recommendation": "Mock Carrier",
                "reasoning": "Mock Reasoning"
            }
            
            # Mock DB save
            with patch("services.db_service.db_service.save_optimization", new_callable=AsyncMock):
                response = await client.post("/api/optimizer/SHP-123")
                assert response.status_code == 200
                assert "recommended_route" in response.json()
