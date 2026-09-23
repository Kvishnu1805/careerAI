import io
from fastapi import UploadFile, HTTPException, status
from pypdf import PdfReader

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def extract_text_from_pdf(file: UploadFile) -> str:
    """Validate uploaded PDF and extract plain text."""
    if file.content_type not in ["application/pdf", "application/x-pdf"]:
        # Also check file extension
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Only PDF files are supported."
            )

    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of 5MB."
        )

    try:
        reader = PdfReader(io.BytesIO(content))
        extracted_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        
        full_text = "\n\n".join(extracted_text).strip()
        if not full_text:
            return "Uploaded PDF had no extractable text. Please ensure the document is not an image-only scan."
        return full_text
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse PDF document: {str(e)}"
        )

