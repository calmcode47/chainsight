from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.gemini_service import gemini_service

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    context: dict

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Query the ChainSight AI assistant using natural language."""
    try:
        response_text = await gemini_service.chat_query(request.question, request.context)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
