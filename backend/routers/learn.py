from fastapi import APIRouter, Depends
from backend.models.user import User
from backend.schemas.learn import LearnAskRequest, LearnAskResponse
from backend.services.auth_service import get_current_user
from backend.services.rag_service import answer_learning_question

router = APIRouter(prefix="/learn", tags=["Learn with AI (RAG)"])

@router.post("/ask", response_model=LearnAskResponse)
def ask_question(
    req: LearnAskRequest,
    current_user: User = Depends(get_current_user)
):
    result = answer_learning_question(question=req.question, topic=req.topic or current_user.target_role)
    return LearnAskResponse(
        answer=result.get("answer", "Focus on practical problem solving and clear communication."),
        sources=result.get("sources", ["CareerAI Knowledge Base"])
    )

