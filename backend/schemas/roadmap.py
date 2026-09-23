from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class RoadmapWeek(BaseModel):
    week: int
    topic: str
    subtopics: List[str]

class RoadmapData(BaseModel):
    weeks: List[RoadmapWeek]

class RoadmapGenerateRequest(BaseModel):
    target_role: Optional[str] = None
    current_skills: Optional[List[str]] = None

class RoadmapResponse(BaseModel):
    id: int
    role: str
    roadmap: RoadmapData
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

