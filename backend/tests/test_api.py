import io
import pytest

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_auth_and_profile_flow(client):
    # 1. Register
    reg_payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "Password123!",
        "target_role": "Backend Engineer",
        "skills": ["Python", "FastAPI", "SQL"]
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "jane@example.com"
    assert "Python" in data["user"]["skills"]
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Duplicate registration should fail
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 2. Login
    login_res = client.post("/api/auth/login", json={"email": "jane@example.com", "password": "Password123!"})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Invalid login should fail
    bad_login = client.post("/api/auth/login", json={"email": "jane@example.com", "password": "wrongpassword"})
    assert bad_login.status_code == 401

    # 3. Get profile
    prof_res = client.get("/api/profile", headers=headers)
    assert prof_res.status_code == 200
    assert prof_res.json()["name"] == "Jane Doe"

    # 4. Update profile
    update_res = client.put("/api/profile", headers=headers, json={
        "target_role": "Senior Cloud Engineer",
        "skills": ["Python", "AWS", "Kubernetes", "Docker"]
    })
    assert update_res.status_code == 200
    assert update_res.json()["target_role"] == "Senior Cloud Engineer"
    assert "AWS" in update_res.json()["skills"]

def test_career_analysis(client):
    # Register candidate
    reg_res = client.post("/api/auth/register", json={
        "name": "Alex Tech",
        "email": "alex@career.ai",
        "password": "SecretPassword123",
        "target_role": "Full Stack Developer",
        "skills": ["React", "Node.js"]
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Call Career Analysis
    res = client.post("/api/career/analyze", headers=headers, json={
        "target_role": "Full Stack Developer",
        "current_skills": ["React", "Node.js"]
    })
    assert res.status_code == 200
    body = res.json()
    assert "strengths" in body and len(body["strengths"]) > 0
    assert "skills_to_improve" in body and len(body["skills_to_improve"]) > 0
    assert "recommended_projects" in body and len(body["recommended_projects"]) > 0

def test_interview_flow(client):
    reg_res = client.post("/api/auth/register", json={
        "name": "Sam Candidate",
        "email": "sam@career.ai",
        "password": "SecretPassword123",
        "target_role": "Frontend Developer",
        "skills": ["JavaScript", "HTML", "CSS"]
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start Interview
    start_res = client.post("/api/interview/start", headers=headers, json={
        "role": "Frontend Developer",
        "difficulty": "Intermediate",
        "num_questions": 2
    })
    assert start_res.status_code == 200
    start_data = start_res.json()
    interview_id = start_data["interview_id"]
    questions = start_data["questions"]
    assert len(questions) > 0
    first_q_id = questions[0]["id"]

    # 2. Answer Question
    ans_res = client.post("/api/interview/answer", headers=headers, json={
        "interview_id": interview_id,
        "question_id": first_q_id,
        "answer": "I use the virtual DOM in React and memoization with useMemo to optimize component rendering."
    })
    assert ans_res.status_code == 200
    ans_data = ans_res.json()
    assert "score" in ans_data
    assert "feedback" in ans_data
    assert "strengths" in ans_data

    # 3. History
    hist_res = client.get("/api/interview/history", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1

def test_roadmap_flow(client):
    reg_res = client.post("/api/auth/register", json={
        "name": "Jordan Learner",
        "email": "jordan@career.ai",
        "password": "SecretPassword123",
        "target_role": "DevOps Engineer",
        "skills": ["Linux", "Git"]
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Generate roadmap
    gen_res = client.post("/api/roadmap/generate", headers=headers, json={
        "target_role": "DevOps Engineer",
        "current_skills": ["Linux", "Git"]
    })
    assert gen_res.status_code == 200
    roadmap_data = gen_res.json()
    assert len(roadmap_data["roadmap"]["weeks"]) > 0

    # Get roadmap
    get_res = client.get("/api/roadmap", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["role"] == "DevOps Engineer"

def test_learn_ask(client):
    reg_res = client.post("/api/auth/register", json={
        "name": "Taylor Asker",
        "email": "taylor@career.ai",
        "password": "SecretPassword123"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/learn/ask", headers=headers, json={
        "question": "How should I structure a technical resume for maximum impact?",
        "topic": "Resume Optimization"
    })
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "sources" in data and len(data["sources"]) > 0

