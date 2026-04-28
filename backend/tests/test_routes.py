import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "version" in data


@pytest.mark.asyncio
async def test_get_shipments(client):
    with patch(
        "services.db_service.db_service.get_all_shipments", new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = [
            {
                "id": "SHP-TEST",
                "origin": {
                    "city": "London",
                    "country": "UK",
                    "lat": 51.5,
                    "lng": -0.1,
                },
                "destination": {
                    "city": "New York",
                    "country": "USA",
                    "lat": 40.7,
                    "lng": -74.0,
                },
                "status": "on_time",
                "carrier": "Maersk",
                "mode": "sea",
                "eta": "2026-05-01",
                "delay_hours": 0,
                "progress_percent": 50,
                "route_nodes": [],
            }
        ]
        response = await client.get("/api/shipments")
        assert response.status_code == 200
        assert len(response.json()) >= 1
        assert response.json()[0]["id"] == "SHP-TEST"


@pytest.mark.asyncio
async def test_get_metrics(client):
    with patch(
        "services.db_service.db_service.get_latest_metrics", new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = {
            "snapshot_at": "2026-04-28T00:00:00Z",
            "total_shipments": 100,
            "on_time": 80,
            "at_risk": 10,
            "delayed": 5,
            "critical": 5,
            "avg_delay_hours": 2.5,
            "disruptions_detected_today": 3,
            "routes_optimized_today": 12,
            "cost_saved_usd": 4500,
        }
        response = await client.get("/api/metrics")
        assert response.status_code == 200
        assert response.json()["total_shipments"] == 100


@pytest.mark.asyncio
async def test_get_shipment_not_found(client):
    with patch(
        "services.db_service.db_service.get_shipment_by_id", new_callable=AsyncMock
    ) as mock_get:
        mock_get.side_effect = HTTPException(status_code=404, detail="Not found")
        response = await client.get("/api/shipments/INVALID")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_optimize_route(client):
    with patch(
        "services.db_service.db_service.get_shipment_by_id", new_callable=AsyncMock
    ) as mock_ship:
        mock_ship.return_value = {
            "id": "SHP-123",
            "origin": {"city": "A", "country": "B", "lat": 0, "lng": 0},
            "destination": {"city": "C", "country": "D", "lat": 0, "lng": 0},
            "status": "delayed",
            "carrier": "Test Carrier",
            "mode": "air",
            "eta": "2026-05-01",
            "progress_percent": 10,
            "delay_hours": 5,
            "route_nodes": [],
        }

        with patch(
            "services.gemini_service.gemini_service.optimize_route",
            new_callable=AsyncMock,
        ) as mock_gemini:
            mock_gemini.return_value = {
                "alternative_route": [],
                "time_saving_hours": 5,
                "cost_delta_usd": -200,
                "risk_reduction_percent": 20,
                "recommended_carrier": "Mock Carrier",
                "gemini_reasoning": "Mock Reasoning",
            }

            with patch(
                "services.db_service.db_service.save_optimization",
                new_callable=AsyncMock,
            ):
                with patch(
                    "services.db_service.db_service.log_ai_call", new_callable=AsyncMock
                ):
                    response = await client.post("/api/optimizer/SHP-123")
                    assert response.status_code == 200
                    assert "alternative_route" in response.json()
