from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ResumeAnalysisResult(BaseModel):
    score: int
    detected_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]

class ResumeResponse(BaseModel):
    id: int
    filename: str
    resume_text: str
    analysis: Optional[ResumeAnalysisResult] = None
    model_config = ConfigDict(from_attributes=True)

class ResumeAnalyzeRequest(BaseModel):
    target_role: Optional[str] = None

