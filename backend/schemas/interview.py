from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class QuestionItem(BaseModel):
    id: int
    question: str
    answer: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[float] = None

class InterviewStartRequest(BaseModel):
    role: str
    difficulty: str = "Intermediate"
    num_questions: int = 3

class InterviewStartResponse(BaseModel):
    interview_id: int
    role: str
    difficulty: str
    questions: List[QuestionItem]

class InterviewAnswerRequest(BaseModel):
    interview_id: int
    question_id: int
    answer: str

class InterviewAnswerResponse(BaseModel):
    question_id: int
    score: float
    feedback: str
    strengths: List[str]
    improvements: List[str]
    average_score: float

class InterviewDetailResponse(BaseModel):
    id: int
    role: str
    difficulty: str
    score: Optional[float] = None
    created_at: datetime
    questions: List[QuestionItem]
    model_config = ConfigDict(from_attributes=True)

class InterviewHistoryItem(BaseModel):
    id: int
    role: str
    difficulty: str
    score: Optional[float] = None
    created_at: datetime
    questions_count: int

