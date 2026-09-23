from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.schemas.career import CareerAnalysisRequest, CareerAnalysisResponse
from backend.services.auth_service import get_current_user
from backend.services.ai_service import call_ai

router = APIRouter(prefix="/career", tags=["Career Analysis"])

@router.post("/analyze", response_model=CareerAnalysisResponse)
def analyze_career(
    req: CareerAnalysisRequest = CareerAnalysisRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = req.target_role or current_user.target_role or "Software Engineer"
    skills = req.current_skills if req.current_skills is not None else [s.skill_name for s in current_user.skills]

    prompt = (
        f"You are a principal tech lead and career coach.\n"
        f"Analyze the candidate's career readiness for the target role: '{role}'.\n"
        f"Candidate's Current Skills: {', '.join(skills) if skills else 'None listed yet'}\n\n"
        "Identify candidate strengths, critical skill gaps/areas to improve, and recommend 3 distinctive "
        "portfolio-grade projects that will make this candidate stand out to hiring managers.\n\n"
        "Return a JSON object with this EXACT structure:\n"
        "{\n"
        f'  "target_role": "{role}",\n'
        '  "strengths": [<list of 3-4 strengths>],\n'
        '  "skills_to_improve": [<list of 3-5 high-priority skills to learn>],\n'
        '  "recommended_projects": [<list of 3 realistic, impressive portfolio project ideas>]\n'
        "}"
    )

    raw_ai_result = call_ai(prompt, response_format="json")

    try:
        validated = CareerAnalysisResponse(
            target_role=raw_ai_result.get("target_role", role),
            strengths=[str(s) for s in raw_ai_result.get("strengths", [])],
            skills_to_improve=[str(s) for s in raw_ai_result.get("skills_to_improve", [])],
            recommended_projects=[str(s) for s in raw_ai_result.get("recommended_projects", [])]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI returned invalid structure: {e}"
        )

    return validated

