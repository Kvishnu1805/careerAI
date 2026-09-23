from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class SkillBase(BaseModel):
    skill_name: str

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    target_role: Optional[str] = "Software Engineer"
    skills: Optional[List[str]] = []

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    target_role: Optional[str] = None
    created_at: Optional[datetime] = None
    skills: List[str] = []
    model_config = ConfigDict(from_attributes=True)

class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    target_role: Optional[str] = None
    skills: Optional[List[str]] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse

