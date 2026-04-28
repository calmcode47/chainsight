from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.gemini_service import gemini_service
from services.db_service import DBService
from middleware.auth import require_auth
from datetime import datetime
import time

router = APIRouter()
db = DBService()


class ChatRequest(BaseModel):
    question: str
    context: dict


class ChatResponse(BaseModel):
    response: str
    timestamp: str


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, user: dict = Depends(require_auth)):
    """
    Handle natural language queries about the supply chain.
    Logs the interaction in Supabase.
    """
    try:
        start_time = time.time()

        # 1. Call Gemini
        response_text = await gemini_service.chat_query(
            request.question, request.context
        )

        latency = int((time.time() - start_time) * 1000)

        # 2. Log AI Call to Supabase
        await db.log_ai_call(
            analysis_type="chat_query",
            input_summary=request.question[:200],  # Store first 200 chars
            gemini_response=response_text,
            tokens_used=0,
            latency_ms=latency,
        )

        return ChatResponse(
            response=response_text, timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
