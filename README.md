# CareerAI — Production-Ready AI Career & Interview Assistant

CareerAI is a modern, responsive full-stack platform designed to accelerate career growth. It enables candidates to upload and analyze resumes, benchmark their skillset against industry standards, simulate live technical and behavioral interviews with instant AI grading, follow personalized 6-week learning roadmaps, and consult an AI career mentor.

---

## 🚀 Live Services & Quick Start

### 1. Prerequisites
- **Python:** 3.10+ (tested on Python 3.14)
- **Node.js:** v18+ (tested on Node.js v22)
- **Database:** MySQL 8.0 (with automatic local SQLite fallback)

### 2. Backend Setup
```bash
# From the project root
python -m pip install fastapi "uvicorn[standard]" pydantic pydantic-settings python-dotenv sqlalchemy pymysql cryptography "python-jose[cryptography]" passlib bcrypt python-multipart pypdf httpx pytest

# Start the FastAPI server (Port 8000)
python -m uvicorn backend.main:app --port 8000 --reload
```
- API Healthcheck: `http://127.0.0.1:8000/api/health`
- Interactive OpenAPI / Swagger Docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
# Navigate to frontend/
cd frontend

# Install dependencies
npm install

# Run the Vite development server (Port 5173)
npm run dev
```
Open `http://127.0.0.1:5173` in your browser.

---

## 🎨 Visual Identity & Brand Design ("Our Site")

- **Primary Colors:** Indigo / Electric Violet (`#4F46E5`, `#6366F1`) and Deep Slate (`#0F172A`).
- **AI Accents:** Cyan (`#06B6D4`) and Emerald Green (`#10B981`) for match gauges, skill badges, and scoring.
- **Surfaces:** Modern glassmorphism panels, dark/light cards with refined borders (`slate-200` / `slate-800`), crisp typography, and touch-friendly mobile drawer menus.
- **Responsiveness:** Mobile-first layout with smooth hamburger drawer navigation, collapsible drawers, and fluid multi-column grids that adapt seamlessly to mobile (375px+), tablet (768px+), and desktop (1280px+).

---

## 🏗️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│             Responsive React + Vite Frontend           │
│  (Tailwind CSS v4, Lucide Icons, Glassmorphism, UI)    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (Axios)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend                      │
│   ├── Auth & JWT Security (bcrypt / python-jose)       │
│   ├── Routers: Profile, Resume, Career, Interview,     │
│   │            Roadmap, Learn                          │
│   ├── Services: AI Gateway, Resume Text, RAG Service   │
│   └── Database Layer: SQLAlchemy (MySQL 8 / SQLite)    │
└───────────────────────────┬────────────────────────────┘
                            ▼
       ┌────────────────────┼───────────────────┐
       ▼                    ▼                   ▼
┌──────────────┐     ┌──────────────┐    ┌──────────────┐
│    MySQL     │     │  AI Service  │    │  ChromaDB /  │
│  (SQLAlchemy │     │ (Gemini/GPT  │    │ Knowledge    │
│    Models)   │     │  Gateway)    │    │  Store (RAG) │
└──────────────┘     └──────────────┘    └──────────────┘
```

### Backend Folder Structure
```
backend/
├── main.py                  # FastAPI app entrypoint, CORS, startup table sync
├── database.py              # SQLAlchemy engine & session with MySQL + SQLite fallback
├── config.py                # Environment configuration loading
├── models/                  # SQLAlchemy ORM models with cascade delete
│   ├── user.py              # User & Skill
│   ├── resume.py            # Resume (with JSON analysis)
│   ├── interview.py         # Interview & InterviewQuestion
│   └── roadmap.py           # Roadmap (with JSON week-by-week)
├── schemas/                 # Pydantic validation schemas
│   ├── user.py
│   ├── resume.py
│   ├── career.py
│   ├── interview.py
│   ├── roadmap.py
│   └── learn.py
├── routers/                 # Thin REST API route handlers
│   ├── auth.py              # /api/auth (register, login, me)
│   ├── profile.py           # /api/profile (GET, PUT)
│   ├── resume.py            # /api/resume (upload, analyze, GET)
│   ├── career.py            # /api/career (analyze)
│   ├── interview.py         # /api/interview (start, answer, history)
│   ├── roadmap.py           # /api/roadmap (generate, GET)
│   └── learn.py             # /api/learn (ask - RAG)
├── services/                # Business logic and external gateways
│   ├── ai_service.py        # Unified call_ai() gateway (Gemini/OpenAI/Dynamic engine)
│   ├── resume_service.py    # PDF text extraction & validation
│   └── rag_service.py       # Knowledge retrieval and contextual Q&A
└── tests/                   # Pytest automated test suite
    ├── conftest.py
    └── test_api.py
```

---

## 🔐 Environment Variables (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | MySQL or SQLite connection URI | `sqlite:///./careerai.db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `super-secret-careerai-key...` |
| `GEMINI_API_KEY` | Optional Google Gemini API key | *(Intelligent fallback active)* |
| `OPENAI_API_KEY` | Optional OpenAI API key | *(Intelligent fallback active)* |

*To connect directly to local MySQL:*
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/careerai
```

---

## 🧪 Automated Testing

Run the full pytest suite:
```bash
python -m pytest backend/tests/test_api.py -v
```
All tests verify authentication, profile updates, resume analysis, career gap evaluation, interview Q&A scoring, roadmap generation, and RAG knowledge search.

---

## 📱 Features Walkthrough

1. **Dashboard:** Central readiness score, target role indicator, quick skill tags, and direct access to all coaching tools.
2. **Resume Analyzer:** Drag-and-drop PDF upload with instant ATS percentage match, detected skills, missing skills, and actionable rewrite recommendations.
3. **Career Gap Analysis:** Tailored comparison against your target role with identified strengths, skills to improve, and 3 standout portfolio projects.
4. **AI Interview Simulator:** Select role and seniority (Junior, Intermediate, Senior), answer questions in real time, and receive instant AI grading with constructive feedback and past history logs.
5. **Personalized Learning Roadmap:** Structured 6-week curriculum with interactive subtopic checkboxes and a dynamic progress bar.
6. **AI Career Mentor (RAG):** Context-grounded career advisor citing curated engineering playbooks and interview best practices.

