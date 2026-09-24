from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
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
    # 1. Fast check if user already exists (only index lookup on email)
    existing_id = db.query(User.id).filter(User.email == req.email.lower().strip()).first()
    if existing_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # 2. Hash password with optimized cost factor
    hashed_pw = get_password_hash(req.password)
    new_user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=hashed_pw,
        target_role=req.target_role or "Software Engineer"
    )
    db.add(new_user)
    # Flush to allocate ID in session without extra network commit/refresh roundtrips
    db.flush()

    # 3. Batch add initial skills in same atomic transaction
    skills_list = []
    if req.skills:
        skills_to_add = []
        for skill_name in req.skills:
            clean_skill = skill_name.strip()
            if clean_skill and clean_skill not in skills_list:
                skills_list.append(clean_skill)
                skills_to_add.append(Skill(user_id=new_user.id, skill_name=clean_skill))
        if skills_to_add:
            db.add_all(skills_to_add)

    # Single commit for user + all skills
    db.commit()

    # Generate token
    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})

    # Construct response directly to avoid extra DB roundtrips over WAN
    user_profile = UserProfileResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        target_role=new_user.target_role,
        created_at=new_user.created_at or datetime.now(),
        skills=skills_list
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_profile
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    # Eager load skills in a single query with joinedload to eliminate secondary WAN roundtrips
    user = (
        db.query(User)
        .options(joinedload(User.skills))
        .filter(User.email == req.email.lower().strip())
        .first()
    )
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

