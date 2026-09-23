from typing import Optional, List
from pydantic import BaseModel

class CareerAnalysisRequest(BaseModel):
    target_role: Optional[str] = None
    current_skills: Optional[List[str]] = None

class CareerAnalysisResponse(BaseModel):
    target_role: str
    strengths: List[str]
    skills_to_improve: List[str]
    recommended_projects: List[str]

