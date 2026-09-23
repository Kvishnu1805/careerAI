from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.models.roadmap import Roadmap
from backend.schemas.roadmap import RoadmapGenerateRequest, RoadmapResponse, RoadmapData, RoadmapWeek
from backend.services.auth_service import get_current_user
from backend.services.ai_service import call_ai

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])

@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(
    req: RoadmapGenerateRequest = RoadmapGenerateRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = req.target_role or current_user.target_role or "Software Engineer"
    skills = req.current_skills if req.current_skills is not None else [s.skill_name for s in current_user.skills]

    prompt = (
        f"You are a Senior Engineering Curriculum Designer.\n"
        f"Design a structured, 6-week personalized learning roadmap for a student aiming for the role of: '{role}'.\n"
        f"Student's Current Skills: {', '.join(skills) if skills else 'Beginner/None specified'}\n\n"
        "Create a comprehensive step-by-step weekly curriculum from foundations to advanced capstone.\n"
        "Return a JSON object with this EXACT structure:\n"
        "{\n"
        '  "weeks": [\n'
        '    {\n'
        '      "week": 1,\n'
        '      "topic": "<Core Topic Title>",\n'
        '      "subtopics": [<list of 3-4 specific concepts, libraries, or tasks>]\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    ai_result = call_ai(prompt, response_format="json")
    weeks_data = ai_result.get("weeks", [])
    
    # Validate and fallback if needed
    if not weeks_data or not isinstance(weeks_data, list):
        weeks_data = [
            {"week": 1, "topic": "Fundamentals & Syntax", "subtopics": ["Data Structures", "Control Flow", "Clean Code"]},
            {"week": 2, "topic": "Architecture & APIs", "subtopics": ["REST APIs", "Database Modeling", "Auth"]},
            {"week": 3, "topic": "Production Projects", "subtopics": ["Full-Stack App", "Dockerization", "Testing"]}
        ]

    roadmap_payload = {"weeks": weeks_data}

    # Save to database (update or create)
    existing_roadmap = db.query(Roadmap).filter(Roadmap.user_id == current_user.id).order_by(Roadmap.id.desc()).first()
    if existing_roadmap:
        existing_roadmap.role = role
        existing_roadmap.roadmap = roadmap_payload
        db.commit()
        db.refresh(existing_roadmap)
        saved_obj = existing_roadmap
    else:
        new_roadmap = Roadmap(
            user_id=current_user.id,
            role=role,
            roadmap=roadmap_payload
        )
        db.add(new_roadmap)
        db.commit()
        db.refresh(new_roadmap)
        saved_obj = new_roadmap

    return RoadmapResponse(
        id=saved_obj.id,
        role=saved_obj.role,
        roadmap=RoadmapData(weeks=[RoadmapWeek(**w) for w in saved_obj.roadmap.get("weeks", [])]),
        created_at=saved_obj.created_at
    )

@router.get("", response_model=RoadmapResponse)
def get_roadmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    roadmap = db.query(Roadmap).filter(Roadmap.user_id == current_user.id).order_by(Roadmap.id.desc()).first()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No roadmap found. Please generate a roadmap first."
        )

    return RoadmapResponse(
        id=roadmap.id,
        role=roadmap.role,
        roadmap=RoadmapData(weeks=[RoadmapWeek(**w) for w in roadmap.roadmap.get("weeks", [])]),
        created_at=roadmap.created_at
    )

