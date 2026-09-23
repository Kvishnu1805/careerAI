from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User, Skill
from backend.schemas.user import UserRegisterRequest, UserLoginRequest, TokenResponse, UserProfileResponse
from backend.services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _format_user_profile(user: User) -> UserProfileResponse:
    skills_list = [s.skill_name for s in user.skills] if user.skills else []
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        target_role=user.target_role,
        created_at=user.created_at,
        skills=skills_list
    )

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_pw = get_password_hash(req.password)
    new_user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=hashed_pw,
        target_role=req.target_role or "Software Engineer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Add any initial skills
    if req.skills:
        for skill_name in req.skills:
            if skill_name.strip():
                skill_obj = Skill(user_id=new_user.id, skill_name=skill_name.strip())
                db.add(skill_obj)
        db.commit()
        db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_format_user_profile(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_format_user_profile(user)
    )

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return _format_user_profile(current_user)

