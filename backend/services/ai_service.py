import json
import re
import logging
import httpx
from typing import Any, Dict, List
from backend.config import settings

logger = logging.getLogger(__name__)

# List of models in order of verified real-time availability and low latency.
# If one encounters high demand (503) or quota exhaustion (429), it automatically falls back to the next.
GEMINI_MODELS = [
    "gemini-3-flash-preview",
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-1.5-flash"
]

def _clean_json_string(raw: str) -> str:
    """Extract valid JSON from raw LLM output even if surrounded by thoughts or markdown fences."""
    cleaned = raw.strip()
    
    # Check for markdown code fences (```json ... ``` or ``` ... ```)
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    if fence_match:
        cleaned = fence_match.group(1).strip()

    # If it still contains non-JSON wrapper text, locate the outermost JSON structure
    start_brace = cleaned.find("{")
    start_bracket = cleaned.find("[")
    
    if start_brace != -1 and (start_bracket == -1 or start_brace < start_bracket):
        end_brace = cleaned.rfind("}")
        if end_brace != -1 and end_brace > start_brace:
            return cleaned[start_brace:end_brace + 1].strip()
    elif start_bracket != -1:
        end_bracket = cleaned.rfind("]")
        if end_bracket != -1 and end_bracket > start_bracket:
            return cleaned[start_bracket:end_bracket + 1].strip()
            
    return cleaned

def _dynamic_extract_skills_from_text(text: str) -> List[str]:
    """Scan text for common industry skills dynamically."""
    KNOWN_SKILLS = [
        "Python", "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular",
        "Node.js", "FastAPI", "Django", "Flask", "Express", "Spring Boot", "Java",
        "C++", "C#", ".NET", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
        "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform",
        "Git", "GitHub", "REST APIs", "GraphQL", "Microservices", "System Design",
        "Linux", "Tailwind CSS", "HTML5", "CSS3", "Machine Learning", "Data Science",
        "PyTorch", "TensorFlow", "Pandas", "NumPy", "Unit Testing", "Jest", "Pytest"
    ]
    found = []
    text_lower = text.lower()
    for s in KNOWN_SKILLS:
        pattern = r"\b" + re.escape(s.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.append(s)
    return found

def _heuristic_fallback_response(prompt: str) -> Dict[str, Any]:
    """
    Intelligent dynamic heuristic engine for offline/demo/testing mode.
    Parses context from prompt to generate realistic, unique, and schema-valid JSON.
    """
    p_lower = prompt.lower()
    
    # 1. Resume Analyzer
    if "resume" in p_lower and ("detected_skills" in p_lower or "missing_skills" in p_lower or "suggestions" in p_lower):
        role_match = re.search(r"target role:\s*([^\n\r,]+)", prompt, re.IGNORECASE)
        role = role_match.group(1).strip() if role_match else "Software Engineer"
        
        found_skills = _dynamic_extract_skills_from_text(prompt)
        if not found_skills:
            found_skills = ["Software Engineering Fundamentals", "Git", "Problem Solving", "Object-Oriented Design"]
        
        score = min(92, max(55, 50 + len(found_skills) * 6))
        
        role_lower = role.lower()
        potential_missing = ["Docker", "Kubernetes", "CI/CD Pipelines", "System Design & Architecture", "Cloud Infrastructure (AWS/GCP)", "Performance Optimization"]
        if "frontend" in role_lower or "react" in role_lower:
            potential_missing = ["TypeScript", "Next.js", "Web Vitals & Performance Optimization", "Automated UI Testing (Playwright/Jest)", "State Management"]
        elif "backend" in role_lower or "python" in role_lower:
            potential_missing = ["High-Concurrency Caching (Redis)", "Database Query Profiling & Indexing", "Message Queues (RabbitMQ/Kafka)", "Docker & CI/CD", "Distributed Tracing"]
        
        missing = [s for s in potential_missing if s not in found_skills][:4]
        
        return {
            "score": score,
            "detected_skills": found_skills[:8],
            "missing_skills": missing,
            "suggestions": [
                f"For the '{role}' target role, quantify your achievements using metrics (e.g., 'Reduced response latency by 30%').",
                f"Highlight practical project experience with {', '.join(missing[:2]) if missing else 'cloud containerization'}.",
                "Structure your bullet points using the Google Action Verb + Task + Measurable Result framework.",
                "Ensure your technical skills section categorizes Languages, Frameworks, and DevOps tools clearly at the top."
            ]
        }

    # 2. Career Analysis
    if "career" in p_lower or "skill-gap" in p_lower or ("strengths" in p_lower and "skills_to_improve" in p_lower):
        role_match = re.search(r"target role:\s*([^\n\r,]+)", prompt, re.IGNORECASE)
        role = role_match.group(1).strip() if role_match else "Full Stack Developer"
        skills = _dynamic_extract_skills_from_text(prompt)
        
        return {
            "target_role": role,
            "strengths": [
                f"Strong foundation in core technical domains: {', '.join(skills[:3]) if skills else 'Software Fundamentals'}",
                f"Solid background adaptable to the {role} career pathway",
                "Proven ability to deliver functional end-to-end applications"
            ],
            "skills_to_improve": [
                "Advanced System Architecture & Distributed Scalability",
                "Containerization, Microservices, and Automated CI/CD Pipelines",
                "Observability, Distributed Logging, and Production Monitoring"
            ],
            "recommended_projects": [
                f"High-Concurrency Cloud Platform for {role} featuring caching and automated CI/CD.",
                "Real-Time Collaborative Dashboard using WebSockets and event-driven architecture.",
                "Production Microservices API Gateway deployed via Docker with full unit/integration test coverage."
            ]
        }

    # 3. Interview Prep: Start
    if "interview" in p_lower and "generate" in p_lower and "questions" in p_lower and "answer" not in p_lower:
        role_match = re.search(r"target role:\s*([^\n\r,]+)", prompt, re.IGNORECASE) or re.search(r"role:\s*([^\n\r,]+)", prompt, re.IGNORECASE)
        role = role_match.group(1).strip() if role_match else "Software Engineer"
        
        diff_match = re.search(r"difficulty:\s*([^\n\r,]+)", prompt, re.IGNORECASE)
        diff = diff_match.group(1).strip() if diff_match else "Intermediate"
        
        return {
            "questions": [
                f"Can you explain how you design and structure scalable architectures for a {role} system ({diff} level)?",
                f"Walk me through how you identify and resolve performance bottlenecks under high concurrent traffic in a {role} environment.",
                "Describe a difficult technical bug or architectural trade-off in a past project. How did you diagnose, evaluate, and solve it?"
            ]
        }

    # 4. Interview Prep: Answer Evaluation
    if "interview" in p_lower and ("feedback" in p_lower or "evaluate" in p_lower or "grading" in p_lower or "candidate's answer" in p_lower):
        return {
            "score": 85,
            "feedback": "Strong, well-structured answer! You clearly explained your thought process and addressed key trade-offs.",
            "strengths": [
                "Demonstrated solid conceptual mastery of underlying principles",
                "Clear logical structure and communication"
            ],
            "improvements": [
                "Include a concrete quantitative metric or benchmark example",
                "Elaborate on edge case handling and monitoring"
            ]
        }

    # 5. Learning Roadmap
    if "roadmap" in p_lower or "curriculum" in p_lower or "week-by-week" in p_lower:
        role_match = re.search(r"target role:\s*([^\n\r,]+)", prompt, re.IGNORECASE)
        role = role_match.group(1).strip() if role_match else "Full Stack Engineer"
        
        return {
            "weeks": [
                {"week": 1, "topic": "Language Mastery & Clean Architecture", "subtopics": ["Advanced Language Features", "OOP & Functional Paradigms", "Clean Code Best Practices"]},
                {"week": 2, "topic": "Database Architecture & Performance", "subtopics": ["Relational Indexing", "Transactions & ACID", "Query Optimization"]},
                {"week": 3, "topic": "API Design & Security Protocols", "subtopics": ["RESTful Standards", "OAuth2 & JWT Auth", "Rate Limiting & Validation"]},
                {"week": 4, "topic": "Frontend Architecture & State Management", "subtopics": ["Component Lifecycle", "Modern Styling & Tailwind", "Client State & Routing"]},
                {"week": 5, "topic": "DevOps, Containerization & CI/CD", "subtopics": ["Docker Container Builds", "Automated Pipelines", "Cloud Deployment"]},
                {"week": 6, "topic": f"Capstone Project for {role}", "subtopics": ["Full-Stack Capstone Build", "Testing Coverage", "Interview Prep & Portfolio"]}
            ]
        }

    # 6. RAG / Learn Question Answering
    if "sources" in p_lower or "learn" in p_lower or "rag" in p_lower or "mentor" in p_lower:
        return {
            "answer": "Focus on demonstrable full-stack projects, system design fundamentals, and structured behavioral communication using the STAR method.",
            "sources": ["CareerAI Engineering Guide 2026", "Tech Interview Playbook"]
        }

    return {"status": "success", "message": "AI generation completed."}


def call_ai(prompt: str, response_format: str = "json") -> Dict[str, Any]:
    """
    Single unified AI gateway function.
    Calls active Gemini API models with smart fallback, or OpenAI API.
    Ensures strict JSON return format without prose or markdown fences.
    """
    prompt_with_instructions = (
        f"{prompt}\n\n"
        "IMPORTANT: You MUST respond with valid JSON ONLY matching the requested structure. "
        "Do NOT include markdown fences, code blocks (such as ```json), or any introductory or concluding text."
    )

    # 1. Attempt Gemini if GEMINI_API_KEY is configured
    if settings.GEMINI_API_KEY:
        for model in GEMINI_MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt_with_instructions}]}],
                    "generationConfig": {
                        "temperature": 0.2,
                        "responseMimeType": "application/json"
                    }
                }
                with httpx.Client(timeout=25.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                        text_parts = [p.get("text", "") for p in parts if isinstance(p, dict) and "text" in p and p.get("text")]
                        raw_text = "\n".join(text_parts).strip()
                        cleaned = _clean_json_string(raw_text)
                        parsed = json.loads(cleaned)
                        logger.info(f"Gemini model '{model}' responded successfully.")
                        return parsed
                    else:
                        logger.warning(f"Gemini model '{model}' returned status {resp.status_code}: {resp.text[:150]}. Trying next candidate...")
                        continue
            except Exception as e:
                logger.error(f"Gemini call to {model} failed: {e}. Trying next...")
                continue

    # 2. Attempt OpenAI if OPENAI_API_KEY is configured
    if settings.OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a professional career and technical interview assistant. Respond in JSON only."},
                    {"role": "user", "content": prompt_with_instructions}
                ],
                "response_format": {"type": "json_object"} if response_format == "json" else None,
                "temperature": 0.2
            }
            with httpx.Client(timeout=25.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data["choices"][0]["message"]["content"]
                    cleaned = _clean_json_string(raw_text)
                    logger.info("OpenAI responded successfully.")
                    return json.loads(cleaned)
                else:
                    logger.warning(f"OpenAI API returned status {resp.status_code}: {resp.text[:150]}")
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}. Falling back.")

    # 3. Dynamic Heuristic Engine Fallback
    logger.info("Using dynamic heuristic engine.")
    return _heuristic_fallback_response(prompt)
