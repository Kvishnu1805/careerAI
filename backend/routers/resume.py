from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.models.resume import Resume
from backend.schemas.resume import ResumeResponse, ResumeAnalyzeRequest, ResumeAnalysisResult
from backend.services.auth_service import get_current_user
from backend.services.resume_service import extract_text_from_pdf
from backend.services.ai_service import call_ai

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Extract text from uploaded PDF
    extracted_text = extract_text_from_pdf(file)

    # Check if user already has a resume, update or create
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
    if resume:
        resume.filename = file.filename
        resume.resume_text = extracted_text
        resume.analysis = None  # Reset analysis on new upload
    else:
        resume = Resume(
            user_id=current_user.id,
            filename=file.filename,
            resume_text=extracted_text,
            analysis=None
        )
        db.add(resume)

    db.commit()
    db.refresh(resume)
    return resume

@router.post("/analyze", response_model=ResumeAnalysisResult)
def analyze_resume(
    req: ResumeAnalyzeRequest = ResumeAnalyzeRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
    if not resume or not resume.resume_text:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload your resume PDF first."
        )

    role = req.target_role or current_user.target_role or "Software Engineer"
    prompt = (
        f"You are an expert technical recruiter and resume reviewer.\n"
        f"Analyze the following candidate resume for the target role of '{role}'.\n\n"
        f"Resume Text:\n{resume.resume_text}\n\n"
        f"Target Role: {role}\n\n"
        "Evaluate the resume thoroughly. Identify skills present, critical industry skills missing for this role, "
        "and provide actionable high-impact suggestions to improve the resume and increase interview callbacks.\n\n"
        "Return a JSON object with this EXACT structure:\n"
        "{\n"
        '  "score": <integer between 0 and 100 representing overall readiness>,\n'
        '  "detected_skills": [<list of strings representing technical and domain skills found>],\n'
        '  "missing_skills": [<list of strings representing important skills missing for this target role>],\n'
        '  "suggestions": [<list of 3-5 specific, actionable bullet point recommendations>]\n'
        "}"
    )

    raw_ai_result = call_ai(prompt, response_format="json")

    # Validate against Pydantic schema
    try:
        raw_score = int(raw_ai_result.get("score", 75))
        if 0 < raw_score <= 10:
            raw_score *= 10
        raw_score = max(0, min(100, raw_score))

        validated = ResumeAnalysisResult(
            score=raw_score,
            detected_skills=[str(s) for s in raw_ai_result.get("detected_skills", [])],
            missing_skills=[str(s) for s in raw_ai_result.get("missing_skills", [])],
            suggestions=[str(s) for s in raw_ai_result.get("suggestions", [])]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI returned invalid structure: {e}"
        )

    # Save analysis in database
    resume.analysis = validated.dict()
    db.commit()
    db.refresh(resume)
    return validated

@router.get("", response_model=ResumeResponse)
def get_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found for current user."
        )
    return resume

