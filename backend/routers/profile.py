from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User, Skill
from backend.schemas.user import UserProfileResponse, UserProfileUpdateRequest
from backend.services.auth_service import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

def _format_profile(user: User) -> UserProfileResponse:
    skills_list = [s.skill_name for s in user.skills] if user.skills else []
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        target_role=user.target_role,
        created_at=user.created_at,
        skills=skills_list
    )

@router.get("", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return _format_profile(current_user)

@router.put("", response_model=UserProfileResponse)
def update_profile(
    req: UserProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.name is not None:
        current_user.name = req.name.strip()
    if req.target_role is not None:
        current_user.target_role = req.target_role.strip()

    if req.skills is not None:
        # Replace skills
        db.query(Skill).filter(Skill.user_id == current_user.id).delete()
        for skill_name in req.skills:
            if skill_name.strip():
                db.add(Skill(user_id=current_user.id, skill_name=skill_name.strip()))

    db.commit()
    db.refresh(current_user)
    return _format_profile(current_user)

