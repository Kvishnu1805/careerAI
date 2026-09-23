from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.models.interview import Interview, InterviewQuestion
from backend.schemas.interview import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    InterviewHistoryItem,
    InterviewDetailResponse,
    QuestionItem
)
from backend.services.auth_service import get_current_user
from backend.services.ai_service import call_ai

router = APIRouter(prefix="/interview", tags=["Interview Prep"])

@router.post("/start", response_model=InterviewStartResponse)
def start_interview(
    req: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    num_q = max(1, min(req.num_questions, 10))
    prompt = (
        f"You are a Senior Technical Interviewer conducting a mock interview.\n"
        f"Target Role: {req.role}\n"
        f"Difficulty Level: {req.difficulty}\n"
        f"Number of Questions: {num_q}\n\n"
        "Generate realistic, challenging technical and behavioral interview questions tailored to this role and seniority.\n"
        "Return a JSON object with this EXACT structure:\n"
        "{\n"
        '  "questions": [<list of question strings>]\n'
        "}"
    )

    ai_result = call_ai(prompt, response_format="json")
    raw_questions = ai_result.get("questions", [])
    if not raw_questions or not isinstance(raw_questions, list):
        raw_questions = [
            f"Explain how you design scalable systems for a {req.role} role.",
            f"How do you handle performance bottlenecks under high load?",
            f"Describe a situation where you had to debug a difficult production issue."
        ]

    # Create interview session
    new_interview = Interview(
        user_id=current_user.id,
        role=req.role,
        difficulty=req.difficulty,
        score=0.0
    )
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    # Create questions in DB
    created_questions = []
    for q_text in raw_questions[:num_q]:
        q_obj = InterviewQuestion(
            interview_id=new_interview.id,
            question=str(q_text)
        )
        db.add(q_obj)
        created_questions.append(q_obj)

    db.commit()
    for q in created_questions:
        db.refresh(q)

    return InterviewStartResponse(
        interview_id=new_interview.id,
        role=new_interview.role,
        difficulty=new_interview.difficulty,
        questions=[
            QuestionItem(
                id=q.id,
                question=q.question,
                answer=q.answer,
                feedback=q.feedback,
                score=q.score
            )
            for q in created_questions
        ]
    )

@router.post("/answer", response_model=InterviewAnswerResponse)
def submit_answer(
    req: InterviewAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.id == req.question_id,
        InterviewQuestion.interview_id == req.interview_id
    ).first()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview question not found."
        )

    interview = db.query(Interview).filter(
        Interview.id == req.interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this interview session."
        )

    prompt = (
        f"You are a strict and helpful Technical Interview Grader.\n"
        f"Role: {interview.role}\n"
        f"Difficulty: {interview.difficulty}\n"
        f"Interview Question: {question.question}\n"
        f"Candidate's Answer:\n{req.answer}\n\n"
        "Grade the candidate's answer carefully. Provide a score between 0 and 100, constructive overall feedback, "
        "strengths demonstrated, and specific points of improvement.\n"
        "Return a JSON object with this EXACT structure:\n"
        "{\n"
        '  "score": <integer from 0 to 100>,\n'
        '  "feedback": "<concise evaluation paragraph>",\n'
        '  "strengths": [<list of 2-3 strengths>],\n'
        '  "improvements": [<list of 2-3 improvements>]\n'
        "}"
    )

    ai_result = call_ai(prompt, response_format="json")

    score_val = float(ai_result.get("score", 75.0))
    feedback_str = str(ai_result.get("feedback", "Good response."))
    strengths_list = [str(s) for s in ai_result.get("strengths", [])]
    improvements_list = [str(s) for s in ai_result.get("improvements", [])]

    # Update question record
    question.answer = req.answer
    question.feedback = feedback_str
    question.score = score_val

    # Recalculate average interview score
    all_questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.interview_id == interview.id
    ).all()
    answered_scores = [q.score for q in all_questions if q.score is not None]
    if answered_scores:
        interview.score = round(sum(answered_scores) / len(answered_scores), 1)

    db.commit()

    return InterviewAnswerResponse(
        question_id=question.id,
        score=score_val,
        feedback=feedback_str,
        strengths=strengths_list,
        improvements=improvements_list,
        average_score=interview.score or score_val
    )

@router.get("/history", response_model=list[InterviewHistoryItem])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interviews = (
        db.query(Interview)
        .filter(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .all()
    )

    result = []
    for it in interviews:
        result.append(InterviewHistoryItem(
            id=it.id,
            role=it.role,
            difficulty=it.difficulty,
            score=it.score,
            created_at=it.created_at,
            questions_count=len(it.questions) if it.questions else 0
        ))
    return result

@router.get("/{interview_id}", response_model=InterviewDetailResponse)
def get_interview_detail(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == current_user.id)
        .first()
    )
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found."
        )

    return InterviewDetailResponse(
        id=interview.id,
        role=interview.role,
        difficulty=interview.difficulty,
        score=interview.score,
        created_at=interview.created_at,
        questions=[
            QuestionItem(
                id=q.id,
                question=q.question,
                answer=q.answer,
                feedback=q.feedback,
                score=q.score
            )
            for q in interview.questions
        ]
    )

@router.delete("/{interview_id}")
def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == current_user.id)
        .first()
    )
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found."
        )
    db.delete(interview)
    db.commit()
    return {"status": "success", "message": "Interview deleted successfully."}

