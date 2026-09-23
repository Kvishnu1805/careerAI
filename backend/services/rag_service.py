import logging
from typing import List, Dict, Any
from backend.services.ai_service import call_ai

logger = logging.getLogger(__name__)

# Built-in high-value career and technical knowledge base chunks
KNOWLEDGE_BASE = [
    {
        "source": "CareerAI Technical Interview Guide",
        "content": (
            "In technical coding and architecture interviews, interviewers evaluate problem decomposition, "
            "communication of trade-offs, and edge case handling. When answering system design questions, "
            "always start with requirements gathering (functional and non-functional), proceed to high-level architecture, "
            "define the data model and API contracts, and address scaling bottlenecks (caching, load balancing, sharding)."
        )
    },
    {
        "source": "Modern Web & Full-Stack Roadmap",
        "content": (
            "Modern web production applications require clean separation of concerns: stateless REST or GraphQL APIs, "
            "JWT/OAuth authentication with HTTP-only cookies or bearer tokens, relational schemas with proper index strategies, "
            "and reactive, mobile-responsive user interfaces with optimistic UI updates and robust error handling."
        )
    },
    {
        "source": "Resume Optimization Best Practices",
        "content": (
            "Technical resumes must pass both Applicant Tracking Systems (ATS) and human engineering manager review. "
            "Structure experience using the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. "
            "Keep resumes to 1 page for junior to mid-level engineers, list technical skills by category (Languages, "
            "Frameworks, Databases, Tools), and link active GitHub repositories with well-documented READMEs."
        )
    },
    {
        "source": "Behavioral STAR Interview Framework",
        "content": (
            "For behavioral questions, structure every response around the STAR method: Situation (set the context in 2 sentences), "
            "Task (what was your responsibility), Action (the specific technical or leadership steps you personally took), "
            "and Result (quantifiable impact, business metric improved, or technical lesson learned)."
        )
    }
]

def search_knowledge_base(query: str, top_k: int = 2) -> List[Dict[str, str]]:
    """Simple term-matching and semantic similarity retriever."""
    query_words = set(query.lower().split())
    scored = []
    for item in KNOWLEDGE_BASE:
        text_words = set(item["content"].lower().split())
        overlap = len(query_words.intersection(text_words))
        scored.append((overlap, item))
    
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in scored[:top_k]]


def answer_learning_question(question: str, topic: str = None) -> Dict[str, Any]:
    """Retrieve relevant context and query the AI gateway."""
    relevant_chunks = search_knowledge_base(question)
    context_str = "\n\n".join([f"Source: {c['source']}\nContent: {c['content']}" for c in relevant_chunks])
    
    prompt = (
        f"You are an expert career and technical interview mentor for students and engineers.\n"
        f"Context from knowledge base:\n{context_str}\n\n"
        f"User Question: {question}\n"
        f"Topic Focus: {topic if topic else 'General Software Engineering'}\n\n"
        "Provide an insightful, encouraging, and highly practical answer based on the context and industry standards.\n"
        "Return a JSON object matching this schema:\n"
        "{\n"
        '  "answer": "Clear, direct, and actionable advice",\n'
        '  "sources": ["Source 1", "Source 2"]\n'
        "}"
    )
    
    result = call_ai(prompt, response_format="json")
    # Validate result
    if "answer" not in result or "sources" not in result:
        result = {
            "answer": result.get("answer", "Focus on practical problem solving and clean architectural fundamentals."),
            "sources": result.get("sources", [c["source"] for c in relevant_chunks])
        }
    return result

