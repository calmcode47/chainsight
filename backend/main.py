from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import asyncio
import json
import traceback
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from routes import shipments, disruptions, optimizer, assistant, analytics, demo
from models.schemas import Shipment
from services.db_service import DBService
from services.seed_service import SeedService
from services.supabase_client import ping_supabase
from services.realtime_service import realtime_service
from services.mock_data import MockDataService

# Environment configuration
IS_PRODUCTION = os.getenv("RAILWAY_ENVIRONMENT") == "production"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title="ChainSight API",
    description="Smart Supply Chain Disruption Detection and Route Optimization API",
    version="2.0.0",
)

db = DBService()
seed_service = SeedService()
mock = MockDataService()

# Configure CORS
origins = (
    [FRONTEND_URL, "http://localhost:5173"] if not IS_PRODUCTION else [FRONTEND_URL]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = f"Unhandled exception: {exc}"
    print(error_msg, file=sys.stderr)

    if IS_PRODUCTION:
        return Response(
            content=json.dumps({"error": "Internal server error", "status": 500}),
            status_code=500,
            media_type="application/json",
        )
    else:
        return Response(
            content=json.dumps(
                {"error": str(exc), "traceback": traceback.format_exc(), "status": 500}
            ),
            status_code=500,
            media_type="application/json",
        )


async def schedule_metrics_snapshots():
    """Background task to save metrics snapshots every 5 minutes."""
    while True:
        try:
            print("📊 Capturing automated metrics snapshot...")
            shipments_data = await db.get_all_shipments(limit=500)
            # Metrics computation logic
            metrics = mock.get_metrics(
                [Shipment(**s) for s in shipments_data]
            ).model_dump()
            await db.save_metrics_snapshot(metrics)
        except Exception as e:
            print(f"Failed to capture background metrics: {e}")
        await asyncio.sleep(300)  # 5 minutes


# Startup Event: Seed database and start background tasks
@app.on_event("startup")
async def startup_event():
    print(
        f"🚀 Initializing ChainSight Backend (Env: {'Production' if IS_PRODUCTION else 'Development'})..."
    )

    try:
        # 1. Seed database with initial mock data
        seed_result = await seed_service.seed_database(force=False)
        print(f"Seed Status: {seed_result}")

        # 2. Start background metrics task
        asyncio.create_task(schedule_metrics_snapshots())

        # 3. Start real-time simulation tasks
        asyncio.create_task(realtime_service.simulate_status_changes())
        asyncio.create_task(realtime_service.simulate_new_alert())

        print("✅ Startup complete.")
    except Exception as e:
        print(f"❌ Startup failed during initialization: {e}")
        traceback.print_exc()
        # Do not raise here to allow health checks to pass even if DB is down (will use mock fallback)


# WebSocket for real-time alerts
@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Generate a new random alert every 15 seconds
            shipments_data = await db.get_all_shipments(limit=50)
            alerts = mock.generate_alerts([Shipment(**s) for s in shipments_data])
            if alerts:
                new_alert = alerts[0].model_dump()
                await websocket.send_text(
                    json.dumps({"type": "new_alert", "data": new_alert})
                )
            await asyncio.sleep(15)
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")


# Include Routers with /api prefix
app.include_router(shipments.router, prefix="/api", tags=["Shipments & Metrics"])
app.include_router(disruptions.router, prefix="/api/disruptions", tags=["Disruptions"])
app.include_router(optimizer.router, prefix="/api/optimizer", tags=["Optimizer"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["Assistant"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

# Demo Routes (Hidden)
if os.getenv("ENABLE_DEMO_ROUTES") == "true":
    app.include_router(demo.router, prefix="/api/demo", tags=["Demo Controls"])


@app.get("/health")
async def health_check():
    """Enhanced production health check."""
    import anyio

    supabase_ok = await anyio.to_thread.run_sync(ping_supabase)
    return {
        "status": "healthy" if (supabase_ok or db.use_mock) else "degraded",
        "environment": "production" if IS_PRODUCTION else "development",
        "supabase": supabase_ok,
        "mock_mode": db.use_mock,
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/db-health")
async def db_health():
    """Check Supabase connectivity."""
    import anyio

    is_alive = await anyio.to_thread.run_sync(ping_supabase)
    return {
        "status": "connected" if is_alive else "mock_fallback",
        "database": "Supabase PostgreSQL",
        "mock_mode": db.use_mock,
    }


@app.get("/api/seed")
async def trigger_seed(force: bool = Query(False)):
    """Manually trigger database re-seeding."""
    result = await seed_service.seed_database(force=force)
    return result


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=not IS_PRODUCTION)
