from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import asyncio
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from routes import shipments, disruptions, optimizer, assistant
from services.mock_data import mock_service

app = FastAPI(
    title="ChainSight API",
    description="Smart Supply Chain Disruption Detection and Route Optimization API",
    version="1.0.0"
)

# Configure CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event: Pre-generate mock data
@app.on_event("startup")
async def startup_event():
    print("Pre-generating mock fleet data...")
    # Seed the cache
    mock_service.generate_shipments(count=100)
    print("Fleet data cached successfully.")

# WebSocket for real-time alerts
@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Generate a new random alert every 15 seconds
            shipments_data = mock_service.generate_shipments(count=50)
            alerts = mock_service.generate_alerts(shipments_data)
            if alerts:
                new_alert = alerts[0].model_dump()
                await websocket.send_text(json.dumps({
                    "type": "new_alert",
                    "data": new_alert
                }))
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

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ChainSight API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
