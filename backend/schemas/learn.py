from typing import Optional, List
from pydantic import BaseModel

class LearnAskRequest(BaseModel):
    question: str
    topic: Optional[str] = None

class LearnAskResponse(BaseModel):
    answer: str
    sources: List[str]

